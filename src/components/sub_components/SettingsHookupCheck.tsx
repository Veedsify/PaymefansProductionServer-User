"use client"
import { useUserAuthContext } from "@/lib/UserUseContext"
import { updateHookupData } from "@/utils/data/UpdateHookupData"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast";

const SettingsHookupCheck = () => {
    const router = useRouter()
    const { user } = useUserAuthContext()
    const handleHookupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "yes" ? true : false
        const selectedValue = e.target.value;
        const radioButtons = document.querySelectorAll(`input[name="${e.target.name}"]`);
        try {
            const response = await updateHookupData({
                hookup: value
            })

            if (response.status === 200 && response.data.status === true) {
                toast.success('Hookup status updated successfully')
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to update hookup status')
        }
    }

    if ((user?.Model && user?.Model?.verification_status === true)) {
        return (
            <>
                <div>
                    <h2 className="mb-4 font-bold mt-10">
                        Are you available for hookup?
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name="hookup"
                            id="yes"
                            value="yes"
                            defaultChecked={user?.Model?.hookup === true}
                            onChange={handleHookupChange}
                            className="w-5 h-5 mt-1 mr-2 bg-transparent accent-primary-dark-pink"
                        />
                        <label htmlFor="yes">Yes</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            name="hookup"
                            id="no"
                            value="no"
                            defaultChecked={user?.Model?.hookup === false}
                            onChange={handleHookupChange}
                            className="w-5 h-5 mt-1 mr-2 bg-transparent accent-primary-dark-pink"
                        />
                        <label htmlFor="no">No</label>
                    </div>
                </div>
            </>
        )
    } else {
        return <></>
    }
}

export default SettingsHookupCheck;