import React from 'react';

interface DeviceFrameProps {
    children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
            {/* Device Bezel */}
            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[844px] w-[390px] shadow-xl">
                {/* Screen Container */}
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>

                {/* Notch / Dynamic Island */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[30px] w-[120px] bg-black rounded-b-2xl z-50 flex justify-center items-center">
                    <div className="w-16 h-4 bg-black rounded-full"></div>
                </div>

                {/* Content Area */}
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-gray-950 relative">
                    {children}
                </div>
            </div>

            {/* Desktop Helper Text */}
            <div className="fixed bottom-8 right-8 text-gray-500 text-sm hidden lg:block">
                <p>Simulated Mobile View</p>
            </div>
        </div>
    );
};
