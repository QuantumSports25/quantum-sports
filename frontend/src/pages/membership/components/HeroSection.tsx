import { Calendar, Shield, Star, Users } from "lucide-react";

const HeroSection = () => {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-blue-500/30 rounded-full px-6 py-2 mb-6">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-gray-300 font-medium">Exclusive Membership Plans</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
                        Unlock Premium
                        <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Sports Experience
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                        Choose your membership plan and enjoy exclusive benefits, priority bookings,
                        and amazing value for your sports activities. Get more for less!
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-green-400" />
                            <span>100% Secure Payment</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-400" />
                            <span>Exclusive Player Rewards</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-purple-400" />
                            <span>Flexible Booking</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;