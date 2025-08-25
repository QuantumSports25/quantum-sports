"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const client_1 = require("@prisma/client");
const stats_model_1 = require("../../models/stats.model");
const booking_model_1 = require("../../models/booking.model");
const prisma = new client_1.PrismaClient();
class StatsService {
    static async getAdminDashboardStats(startDate, endDate) {
        try {
            const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const stats = await prisma.$queryRaw `
        SELECT
            COUNT(*) AS total_users,
            COUNT(CASE WHEN role = 'partner' THEN 1 END) AS total_partners,
            COUNT(CASE WHEN role = 'user' THEN 1 END) AS total_only_users,

            -- Current period counts
            COUNT(CASE WHEN role = 'user'
                AND "createdAt" >= ${startDate}
                AND "createdAt" < ${endDate}
                THEN 1 END) AS users_in_range,

            COUNT(CASE WHEN role = 'partner'
                AND "createdAt" >= ${startDate}
                AND "createdAt" < ${endDate}
                THEN 1 END) AS partners_in_range,

            -- Previous period counts (same length as current period)
            COUNT(CASE WHEN role = 'user'
                AND "createdAt" >= (${startDate}::timestamp - INTERVAL '${dayCount} days')
                AND "createdAt" < ${startDate}
                THEN 1 END) AS users_in_previous_range,

            COUNT(CASE WHEN role = 'partner'
                AND "createdAt" >= (${startDate}::timestamp - INTERVAL '${dayCount} days')
                AND "createdAt" < ${startDate}
                THEN 1 END) AS partners_in_previous_range
        FROM users;
        `;
            const row = stats[0];
            if (!row) {
                throw new Error(`No data found for admin dashboard stats for date range ${startDate.toISOString()} - ${endDate.toISOString()}`);
            }
            const usersInRange = Number(row.users_in_range);
            const partnersInRange = Number(row.partners_in_range);
            const usersInPrevious = Number(row.users_in_previous_range);
            const partnersInPrevious = Number(row.partners_in_previous_range);
            const userGrowth = usersInPrevious
                ? ((usersInRange - usersInPrevious) / usersInPrevious) * 100
                : 100;
            const partnerGrowth = partnersInPrevious
                ? ((partnersInRange - partnersInPrevious) / partnersInPrevious) * 100
                : 100;
            return {
                total_users: Number(row.total_users),
                total_partners: Number(row.total_partners),
                total_only_users: Number(row.total_only_users),
                partners_in_range: Number(row.partners_in_range),
                users_in_range: Number(row.users_in_range),
                user_growth: userGrowth < 0 ? 0 : userGrowth,
                partner_growth: partnerGrowth < 0 ? 0 : partnerGrowth,
            };
        }
        catch (error) {
            console.error(error);
            throw new Error(`Failed to retrieve admin dashboard stats for date range ${startDate.toISOString()} - ${endDate.toISOString()}`);
        }
    }
    static async getGrowthData(startDate, endDate, mode = stats_model_1.StatsMode.Monthly) {
        const result = await prisma.$queryRaw `
    SELECT
      CASE 
        WHEN ${mode} = 'yearly'
          THEN TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon')
        ELSE TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD')
      END AS period,
      COUNT(CASE WHEN "role" = 'user' THEN 1 END) AS "userCount",
      COUNT(CASE WHEN "role" = 'partner' THEN 1 END) AS "partnerCount",
      COUNT(*) AS "totalCount"
    FROM "users"
    WHERE "createdAt" >= ${startDate} AND "createdAt" < ${endDate}
    GROUP BY period
    ORDER BY MIN("createdAt");
  `;
        return result.map((r) => ({
            period: r.period,
            userCount: Number(r.userCount),
            partnerCount: Number(r.partnerCount),
            totalCount: Number(r.totalCount),
        }));
    }
    static async getVenueStats(startDate, endDate, partnerId) {
        try {
            const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const previousStartDate = new Date(startDate.getTime() - dayCount * 24 * 60 * 60 * 1000);
            const previousEndDate = startDate;
            let query = `
      SELECT
        COUNT(*) AS "totalVenues",
        COUNT(CASE WHEN "createdAt" >= $1 AND "createdAt" < $2 THEN 1 END) AS "venuesInRange",
        COUNT(CASE WHEN "createdAt" >= $3 AND "createdAt" < $4 THEN 1 END) AS "venuesInPreviousRange"
      FROM venues
    `;
            const params = [
                startDate,
                endDate,
                previousStartDate,
                previousEndDate,
            ];
            if (partnerId) {
                query += ` WHERE "partnerId" = $5`;
                params.push(partnerId);
            }
            const venueStats = await prisma.$queryRawUnsafe(query, ...params);
            const row = venueStats[0];
            if (!row) {
                throw new Error(`No data found for venue stats for date range ${startDate.toISOString()} - ${endDate.toISOString()}`);
            }
            const totalVenues = Number(row.totalVenues);
            const venuesInRange = Number(row.venuesInRange);
            const venuesInPreviousRange = Number(row.venuesInPreviousRange);
            const venueGrowth = venuesInPreviousRange > 0
                ? ((venuesInRange - venuesInPreviousRange) / venuesInPreviousRange) *
                    100
                : venuesInRange > 0
                    ? 100
                    : 0;
            return {
                totalVenues,
                venuesInRange,
                venueGrowth,
            };
        }
        catch (error) {
            console.error(error);
            throw new Error(`Failed to retrieve venue stats for date range ${startDate.toISOString()} - ${endDate.toISOString()}`);
        }
    }
    static async getBookingPaymentStats(startDate, endDate, status = booking_model_1.BookingStatus.Confirmed, partnerId) {
        try {
            const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const previousStartDate = new Date(startDate.getTime() - dayCount * 24 * 60 * 60 * 1000);
            const previousEndDate = startDate;
            const params = [
                status,
                startDate,
                endDate,
                previousStartDate,
                previousEndDate,
            ];
            let partnerCondition = "";
            if (partnerId) {
                partnerCondition = `AND (b.type = 'venue' AND b."bookingData"->>'partnerId' = $6)`;
                params.push(partnerId);
            }
            const query = `
            WITH booking_payments AS ( 
            SELECT
            b.id AS booking_id,
            b."confirmedAt",
            b."paymentDetails" AS payment
            FROM "bookings" b 
            WHERE b."bookingStatus" = $1::"BookingStatus" 
            ${partnerCondition} 
            )
            SELECT
            'total' AS method,
            COUNT(*) AS total_count,
            COALESCE(SUM((payment->>'paymentAmount')::numeric),0) AS total_amount,
            COUNT(*) FILTER (
                WHERE "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $2
                AND "confirmedAt" < $3
            ) AS count_in_range,
            COALESCE(SUM((payment->>'paymentAmount')::numeric) FILTER (
                WHERE "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $2
                AND "confirmedAt" < $3
            ),0) AS amount_in_range,
            COUNT(*) FILTER (
                WHERE "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $4
                AND "confirmedAt" < $5
            ) AS count_in_previous,
            COALESCE(SUM((payment->>'paymentAmount')::numeric) FILTER (
                WHERE "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $4
                AND "confirmedAt" < $5
            ),0) AS amount_in_previous
            FROM booking_payments

            UNION ALL
            -- Wallet
            SELECT
            'Wallet' AS method,
            COUNT(*) AS total_count,
            COALESCE(SUM((payment->>'paymentAmount')::numeric),0) AS total_amount,
            COUNT(*) FILTER (
                WHERE (payment->>'paymentMethod') = 'Wallet'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $2
                AND "confirmedAt" < $3
            ) AS count_in_range,
            COALESCE(SUM((payment->>'paymentAmount')::numeric) FILTER (
                WHERE (payment->>'paymentMethod') = 'Wallet'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $2
                AND "confirmedAt" < $3
            ),0) AS amount_in_range,
            COUNT(*) FILTER (
                WHERE (payment->>'paymentMethod') = 'Wallet'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $4
                AND "confirmedAt" < $5
            ) AS count_in_previous,
            COALESCE(SUM((payment->>'paymentAmount')::numeric) FILTER (
                WHERE (payment->>'paymentMethod') = 'Wallet'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $4
                AND "confirmedAt" < $5
            ),0) AS amount_in_previous
            FROM booking_payments

            UNION ALL
            -- Razorpay
            SELECT
            'Razorpay' AS method,
            COUNT(*) AS total_count,
            COALESCE(SUM((payment->>'paymentAmount')::numeric),0) AS total_amount,
            COUNT(*) FILTER (
                WHERE (payment->>'paymentMethod') = 'Razorpay'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $2
                AND "confirmedAt" < $3
            ) AS count_in_range,
            COALESCE(SUM((payment->>'paymentAmount')::numeric) FILTER (
                WHERE (payment->>'paymentMethod') = 'Razorpay'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $2
                AND "confirmedAt" < $3
            ),0) AS amount_in_range,
            COUNT(*) FILTER (
                WHERE (payment->>'paymentMethod') = 'Razorpay'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $4
                AND "confirmedAt" < $5
            ) AS count_in_previous,
            COALESCE(SUM((payment->>'paymentAmount')::numeric) FILTER (
                WHERE (payment->>'paymentMethod') = 'Razorpay'
                AND "confirmedAt" IS NOT NULL
                AND "confirmedAt" >= $4
                AND "confirmedAt" < $5
            ),0) AS amount_in_previous
            FROM booking_payments;
        `;
            const rawStats = await prisma.$queryRawUnsafe(query, ...params);
            if (!rawStats || rawStats.length === 0) {
                return [];
            }
            return rawStats.map((r) => {
                const countInRange = Number(r.count_in_range);
                const countInPrevious = Number(r.count_in_previous);
                const amountInRange = Number(r.amount_in_range);
                const amountInPrevious = Number(r.amount_in_previous);
                const countGrowth = countInPrevious
                    ? ((countInRange - countInPrevious) / countInPrevious) * 100
                    : 100;
                const amountGrowth = amountInPrevious
                    ? ((amountInRange - amountInPrevious) / amountInPrevious) * 100
                    : 100;
                return {
                    method: r.method,
                    total_count: Number(r.total_count),
                    total_amount: Number(r.total_amount),
                    count_in_range: countInRange,
                    amount_in_range: amountInRange,
                    count_growth: Math.round(countGrowth) < 0 ? 0 : Math.round(countGrowth),
                    amount_growth: Math.round(amountGrowth) < 0 ? 0 : Math.round(amountGrowth),
                };
            });
        }
        catch (error) {
            console.error(error);
            throw new Error("Failed to retrieve confirmed booking payment stats");
        }
    }
    static async getBookingRevenueGrowthData(startDate, endDate, status, mode = stats_model_1.StatsMode.Monthly, partnerId) {
        try {
            const params = [status, startDate, endDate];
            let partnerCondition = "";
            if (partnerId) {
                partnerCondition = `AND (b.type = 'venue' AND b."bookingData"->>'partnerId' = $4)`;
                params.push(partnerId);
            }
            const dateTrunc = mode === stats_model_1.StatsMode.Yearly
                ? `TO_CHAR(DATE_TRUNC('month', "confirmedAt"), 'Mon')`
                : `TO_CHAR(DATE_TRUNC('day', "confirmedAt"), 'YYYY-MM-DD')`;
            const query = `
      WITH booking_payments AS (
        SELECT
          b.id AS booking_id,
          b."confirmedAt",
          b."paymentDetails" AS payment
        FROM "bookings" b
        WHERE b."bookingStatus" = $1::"BookingStatus"
          ${partnerCondition}
      )
      SELECT
        COALESCE(payment->>'paymentMethod', 'total') AS method,
        ${dateTrunc} AS period,
        COUNT(*) AS booking_count,
        COALESCE(SUM((payment->>'paymentAmount')::numeric), 0) AS revenue
      FROM booking_payments
      WHERE "confirmedAt" IS NOT NULL
        AND "confirmedAt" >= $2
        AND "confirmedAt" < $3
      GROUP BY GROUPING SETS (
        (${dateTrunc}, payment->>'paymentMethod'),
        (${dateTrunc})
      )
      ORDER BY period, method;
    `;
            const rawStats = await prisma.$queryRawUnsafe(query, ...params);
            const result = {
                total: [],
                Wallet: [],
                Razorpay: [],
            };
            rawStats.forEach((r) => {
                const method = r.method;
                if (!result[method]) {
                    result[method] = [];
                }
                result[method].push({
                    method,
                    period: r.period,
                    booking_count: Number(r.booking_count),
                    revenue_growth: Number(r.revenue),
                });
            });
            return result;
        }
        catch (error) {
            console.error(error);
            throw new Error("Failed to retrieve booking & revenue growth data");
        }
    }
    static async getMembershipStats(startDate, endDate, planId) {
        try {
            const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const params = [startDate, endDate, dayCount];
            let planCondition = "";
            let prevPlanCondition = "";
            if (planId) {
                planCondition = `AND "planId" = $4`;
                prevPlanCondition = `AND "planId" = $4`;
                params.push(planId);
            }
            const query = `
      SELECT
        COUNT(*) AS total_memberships,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) AS active_memberships,

        -- Current period memberships
        COUNT(CASE WHEN "createdAt" >= $1 
                   AND "createdAt" < $2
                   ${planCondition}
             THEN 1 END) AS memberships_in_range,

        -- Previous period memberships
        COUNT(CASE WHEN "createdAt" >= ($1::timestamp - INTERVAL '$3 days')
                   AND "createdAt" < $1
                   ${prevPlanCondition}
             THEN 1 END) AS memberships_in_previous_range,

        -- Credits given in current period
        COALESCE(SUM(CASE WHEN "createdAt" >= $1
                          AND "createdAt" < $2
                          ${planCondition}
                     THEN "creditsGiven" END), 0) AS credits_in_range,

        -- Credits given in previous period
        COALESCE(SUM(CASE WHEN "createdAt" >= ($1::timestamp - INTERVAL '$3 days')
                          AND "createdAt" < $1
                          ${prevPlanCondition}
                     THEN "creditsGiven" END), 0) AS credits_in_previous_range
      FROM "memberships";
    `;
            const stats = await prisma.$queryRawUnsafe(query, ...params);
            const row = stats[0];
            if (!row)
                throw new Error("No membership stats found.");
            const membershipsInRange = Number(row.memberships_in_range);
            const membershipsInPrevious = Number(row.memberships_in_previous_range);
            const creditsInRange = Number(row.credits_in_range);
            const creditsInPrevious = Number(row.credits_in_previous_range);
            const membershipGrowth = membershipsInPrevious
                ? ((membershipsInRange - membershipsInPrevious) /
                    membershipsInPrevious) *
                    100
                : 100;
            const creditsGrowth = creditsInPrevious
                ? ((creditsInRange - creditsInPrevious) / creditsInPrevious) * 100
                : 100;
            return {
                total_memberships: Number(row.total_memberships),
                active_memberships: Number(row.active_memberships),
                memberships_in_range: membershipsInRange,
                membership_growth: Math.round(membershipGrowth),
                credits_in_range: creditsInRange,
                credits_growth: Math.round(creditsGrowth),
            };
        }
        catch (error) {
            console.error(error);
            throw new Error(`Failed to retrieve membership stats for date range ${startDate.toISOString()} - ${endDate.toISOString()}`);
        }
    }
}
exports.StatsService = StatsService;
//# sourceMappingURL=stats.services.js.map