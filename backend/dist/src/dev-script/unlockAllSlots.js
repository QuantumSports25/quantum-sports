"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevScript = void 0;
const venue_model_1 = require("../models/venue.model");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DevScript {
}
exports.DevScript = DevScript;
_a = DevScript;
DevScript.unlockAllSlots = async (req, res) => {
    try {
        const { from, to } = req.query;
        let fromDate;
        let toDate;
        if (from)
            fromDate = new Date(from);
        if (to)
            toDate = new Date(to);
        if ((fromDate && isNaN(fromDate.getTime())) ||
            (toDate && isNaN(toDate.getTime()))) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format for 'from' or 'to'",
            });
        }
        const updatedAtFilter = {};
        if (fromDate)
            updatedAtFilter.gte = fromDate;
        if (toDate)
            updatedAtFilter.lte = toDate;
        const whereClause = {
            availability: venue_model_1.SlotAvailability.Locked,
            ...(Object.keys(updatedAtFilter).length && {
                updatedAt: updatedAtFilter,
            }),
        };
        const result = await prisma.slot.updateMany({
            where: whereClause,
            data: {
                availability: venue_model_1.SlotAvailability.Available,
                bookingId: null,
            },
        });
        if (result.count > 0) {
            return res
                .status(200)
                .json({ success: true, message: "All slots unlocked successfully" });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "No locked slots found in the given range",
            });
        }
    }
    catch (error) {
        console.error("Error unlocking all slots:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
//# sourceMappingURL=unlockAllSlots.js.map