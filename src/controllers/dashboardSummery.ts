import AppError from '../errors/AppError'
import { BookHome } from '../models/bookHome.model'
import { Facility } from '../models/facility.model'
import payment from '../models/payment'
import { User } from '../models/user.model'
import { VisitBooking } from '../models/visitBooking.model'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import { Request, Response } from 'express'
import  httpStatus  from 'http-status';

const getAdminDashboardSummery = catchAsync(async (req, res) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // 📅 Current month range
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1)
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1)

    // 📅 Previous month range
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1)
    const startOfCurrentMonthCopy = new Date(currentYear, currentMonth, 1)

    const calcGrowth = (now: number, prev: number) => {
        if (prev === 0) return now > 0 ? 100 : 0
        const growth = ((now - prev) / prev) * 100
        return Math.min(100, Math.max(-100, Number(growth.toFixed(1))))
    }

    // 🏢 Facilities
    const facilitiesNow = await Facility.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    })
    const facilitiesLast = await Facility.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    })

    // 👥 Service Providers
    const serviceProvidersNow = await User.countDocuments({
        role: 'organization',
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    })
    const serviceProvidersLast = await User.countDocuments({
        role: 'organization',
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    })

    // 👤 Customers
    const customersNow = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    })
    const customersLast = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    })

    // 📅 Bookings
    const visitToursNow = await VisitBooking.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    })
    const visitToursLast = await VisitBooking.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    })

    const facilityBookingsNow = await BookHome.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    })
    const facilityBookingsLast = await BookHome.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    })

    const totalBookingsNow = visitToursNow + facilityBookingsNow
    const totalBookingsLast = visitToursLast + facilityBookingsLast

    // 💰 Payments (Revenue)
    const paymentsNow = await payment.aggregate([
        {
            $match: {
                status: "paid",
                createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth }
            }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    const paymentsLast = await payment.aggregate([
        {
            $match: {
                status: "paid",
                createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy }
            }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ])

    const revenueNow = paymentsNow[0]?.total || 0
    const revenueLast = paymentsLast[0]?.total || 0

    // 📊 Summary
    const summary = {
        totalFacilities: facilitiesNow,
        facilitiesGrowth: calcGrowth(facilitiesNow, facilitiesLast),

        totalServiceProviders: serviceProvidersNow,
        serviceProvidersGrowth: calcGrowth(serviceProvidersNow, serviceProvidersLast),

        totalCustomers: customersNow,
        customersGrowth: calcGrowth(customersNow, customersLast),

        totalBookings: totalBookingsNow,
        bookingsGrowth: calcGrowth(totalBookingsNow, totalBookingsLast),

        totalEarnings: revenueNow,
        earningsGrowth: calcGrowth(revenueNow, revenueLast)
    }

    return res.status(200).json({
        success: true,
        message: 'Admin dashboard summary (monthly) fetched successfully',
        data: summary,
    })
})


export const getMonthlyEarnings = catchAsync(
    async (req: Request, res: Response) => {
        const year = Number(req.query.year) || new Date().getFullYear() // optional query param to filter by year

        const earnings = await payment.aggregate([
            // Only include paid payments
            { $match: { status: 'paid' } },

            // Filter by year
            {
                $addFields: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
            },
            { $match: { year: year } },

            // Group by month and sum amounts
            {
                $group: {
                    _id: '$month',
                    totalEarnings: { $sum: '$amount' },
                },
            },

            // Sort by month
            { $sort: { _id: 1 } },
        ])

        // Format result to be more readable
        const formattedEarnings = Array.from({ length: 12 }, (_, i) => {
            const monthData = earnings.find((e) => e._id === i + 1)
            return {
                month: i + 1,
                totalEarnings: monthData ? monthData.totalEarnings : 0,
            }
        })

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Monthly earnings fetched successfully',
            data: formattedEarnings,
        })
    }
)


// GET Org Dashboard Stats
export const getOrgDashboardStaticData = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not found')
    }

    // 🔹 Last Month Range
    const today = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(today.getMonth() - 1) // last 30 days

    // ✅ Upcoming Tours (only from last month forward)
    const upcomingTours = await VisitBooking.countDocuments({
      organizationId: userId,
      date: { $gte: lastMonth, $lte: today },
    }).sort({ date: 1 })

    // ✅ Total Bookings in last month
    const totalBookings = await BookHome.countDocuments({
      createdAt: { $gte: lastMonth, $lte: today },
    })

    // ✅ Total Earnings in last month
    const totalEarningsAgg = await payment.aggregate([
      {
        $match: {
          userId,
          status: 'paid',
          createdAt: { $gte: lastMonth, $lte: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const totalEarnings =
      totalEarningsAgg.length > 0 ? totalEarningsAgg[0].total : 0

    // ✅ Residents Served in last month
    const residentsServedAgg = await BookHome.aggregate([
      { $match: { createdAt: { $gte: lastMonth, $lte: today } } },
      { $unwind: '$residentialInfo' },
      { $count: 'totalResidents' },
    ])
    const residentsServed =
      residentsServedAgg.length > 0 ? residentsServedAgg[0].totalResidents : 0

    // ✅ Final Response
    res.status(200).json({
      success: true,
      data: {
        upcomingTours,
        totalBookings,
        totalEarnings,
        residentsServed,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const dashboardSummeryController = {
  getAdminDashboardSummery,
  getOrgDashboardStaticData,
}

export default dashboardSummeryController
