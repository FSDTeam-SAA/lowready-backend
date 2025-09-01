import { BookHome } from '../models/bookHome.model'
import { Facility } from '../models/facility.model'
import payment from '../models/payment'
import { User } from '../models/user.model'
import { VisitBooking } from '../models/visitBooking.model'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import { Request, Response } from 'express'

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

const dashboardSummeryController = {
    getAdminDashboardSummery,
}

export default dashboardSummeryController
