
import { BookHome } from "../models/bookHome.model";
import { Facility } from "../models/facility.model";
import { User } from "../models/user.model";
import { VisitBooking } from "../models/visitBooking.model";
import catchAsync from "../utils/catchAsync";


const getAdminDashboardSummery = catchAsync(async (req, res) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 📅 Current month range
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // 📅 Previous month range
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const startOfCurrentMonthCopy = new Date(currentYear, currentMonth, 1);

    const calcGrowth = (now: number, prev: number) => {
        if (prev === 0) return now > 0 ? 100 : 0;
        const growth = ((now - prev) / prev) * 100;
        return Math.min(100, Math.max(-100, Number(growth.toFixed(1))));
    };

    // 🏢 Facilities
    const facilitiesNow = await Facility.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const facilitiesLast = await Facility.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });

    // 👥 Service Providers
    const serviceProvidersNow = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const serviceProvidersLast = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });

    // 👤 Customers
    const customersNow = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const customersLast = await User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });

    // 📅 Bookings
    const visitToursNow = await VisitBooking.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const visitToursLast = await VisitBooking.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });

    const facilityBookingsNow = await BookHome.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const facilityBookingsLast = await BookHome.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });

    const totalBookingsNow = visitToursNow + facilityBookingsNow;
    const totalBookingsLast = visitToursLast + facilityBookingsLast;


    // console.log({
    //     "facility": "facility",
    //     "this month": facilitiesNow,
    //     "last month": facilitiesLast,
    //     "this month - last month": facilitiesNow - facilitiesLast,
    //     "this month %": calcGrowth(facilitiesNow, facilitiesLast),
    // })

    // console.log({
    //     "service provider": "service provider",
    //     "this month": serviceProvidersNow,
    //     "last month": serviceProvidersLast,
    //     "this month - last month": serviceProvidersNow - serviceProvidersLast,
    //     "this month %": calcGrowth(serviceProvidersNow, serviceProvidersLast),
    // })

    // console.log({
    //     "customer": "customer",
    //     "this month": customersNow,
    //     "last month": customersLast,
    //     "this month - last month": customersNow - customersLast,
    //     "this month %": calcGrowth(customersNow, customersLast),
    // })

    // console.log({
    //     "booking": "booking",
    //     "this month": totalBookingsNow,
    //     "last month": totalBookingsLast,
    //     "this month - last month": totalBookingsNow - totalBookingsLast,
    //     "this month %": calcGrowth(totalBookingsNow, totalBookingsLast),
    // })


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
    };

    return res.status(200).json({
        success: true,
        message: "Admin dashboard summary (monthly) fetched successfully",
        data: summary,
    });
});





const dashboardSummeryController = {
    getAdminDashboardSummery
}

export default dashboardSummeryController