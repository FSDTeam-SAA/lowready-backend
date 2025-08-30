
import { BookHome } from "../models/bookHome.model";
import { Facility } from "../models/facility.model";
import { User } from "../models/user.model";
import { VisitBooking } from "../models/visitBooking.model";
import catchAsync from "../utils/catchAsync";


const getAdminDashboardSummery = catchAsync(async (req, res) => {

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const startOfCurrentYear = new Date(`${currentYear}-01-01T00:00:00Z`);
    const startOfNextYear = new Date(`${currentYear + 1}-01-01T00:00:00Z`);
    const startOfLastYear = new Date(`${lastYear}-01-01T00:00:00Z`);

    const calcGrowth = (now: number, prev: number) => {
        if (prev === 0) return now > 0 ? 100 : 0;
        return Number((((now - prev) / prev) * 100).toFixed(1));
    };

    const facilitiesNow = await Facility.countDocuments({
        createdAt: { $gte: startOfCurrentYear, $lt: startOfNextYear },
    });
    const facilitiesLast = await Facility.countDocuments({
        createdAt: { $gte: startOfLastYear, $lt: startOfCurrentYear },
    });

    const usersNow = await User.countDocuments({
        createdAt: { $gte: startOfCurrentYear, $lt: startOfNextYear },
    });
    const usersLast = await User.countDocuments({
        createdAt: { $gte: startOfLastYear, $lt: startOfCurrentYear },
    });


    const visitToursNow = await VisitBooking.countDocuments({
        createdAt: { $gte: startOfCurrentYear, $lt: startOfNextYear },
    });
    const visitToursLast = await VisitBooking.countDocuments({
        createdAt: { $gte: startOfLastYear, $lt: startOfCurrentYear },
    });

    const facilityBookingsNow = await BookHome.countDocuments({
        createdAt: { $gte: startOfCurrentYear, $lt: startOfNextYear },
    });
    const facilityBookingsLast = await BookHome.countDocuments({
        createdAt: { $gte: startOfLastYear, $lt: startOfCurrentYear },
    });

    const totalBookingsNow = visitToursNow + facilityBookingsNow;
    const totalBookingsLast = visitToursLast + facilityBookingsLast;

    const summary = {
        totalFacilities: facilitiesNow,
        facilitiesGrowth: calcGrowth(facilitiesNow, facilitiesLast),

        totalServiceProviders: usersNow,
        totalCustomers: usersNow,
        customersGrowth: calcGrowth(usersNow, usersLast),

        totalBookings: totalBookingsNow,
        bookingsGrowth: calcGrowth(totalBookingsNow, totalBookingsLast),
    };

    return res.status(200).json({
        success: true,
        message: "Admin dashboard summary fetched successfully",
        data: summary,
    });
});




const dashboardSummeryController = {
    getAdminDashboardSummery
}

export default dashboardSummeryController