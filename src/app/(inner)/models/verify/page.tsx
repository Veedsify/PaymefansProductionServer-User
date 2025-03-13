import Image from "next/image";

const ModelsVerify = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-2">
            <div className="text-center lg:w-3/5">
                <Image height={160} width={160} priority src="/images/My project-1 (49) 1.png" alt="" className="w-40 h-40 rounded-lg object-cover mx-auto my-2" />
                <h3 className="text-2xl font-bold">Verify Yourself</h3>
                <p className="leading-5 max-w-[90%] mx-auto  text-sm mt-5">Help us keep PayMeFans safe and honest by verifying yourself with a peace sign.</p>
                <p className="text-sm lg:max-w-[90%] mx-auto leading-5 mt-5">We’ll only use your photo to confirm you’re you, so it doesn&apos;t have to be your best.</p>
                <div className="mt-8">

                    <button className="bg-primary-dark-pink w-4/5 p-4 rounded-lg  text-white font-bold ">VERIFY</button>
                </div>
            </div>
        </div>
    );
}
function ModelVerificationSuccess() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-2">
            <div className="text-center lg:w-3/5">
                <Image height={64} width={64} src="/images/fi-rr-thumbs-up.png" alt="" className="w-16 h-16 rounded-lg object-cover mx-auto my-2" />
                <p className="leading-5 max-w-[90%] mx-auto  text-sm mt-5 font-semibold">Your details have been sent for review, you will be notified via email once approved.</p>
                <div className="mt-8">
                    <button className="bg-primary-dark-pink w-4/5 p-4 rounded-lg  text-white font-bold ">OK</button>
                </div>
            </div>
        </div>
    );
}

export default ModelsVerify;