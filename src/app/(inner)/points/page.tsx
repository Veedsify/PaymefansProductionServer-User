import PointsBuy from "@/features/points/Points";
import getAllPoints from "@/utils/data/GetPoints";
import AddPoints from "@/features/points/AddPoints";

type Points = {
    points: number;
    amount: number;
    points_buy_id: string;
}

// const Points = async () => {
//     const points: Points[] = await getAllPoints()
//     return (
//         <div>
//             <div className="p-4 dark:text-white">
//                 <h1 className="pt-4 mb-10 text-2xl font-bold">
//                     Points
//                 </h1>
//                 <div className="mb-20 grid grid-cols-3 gap-3 md:gap-6 md:mb-0">
//                     {points.map((point, index) => (
//                         <PointsBuy key={index} point={point}/>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }

const Points = () => {
    return (
        <>
            <div>
                <div className="p-4 md:p-8 dark:text-white">
                    <h1 className="pt-4 mb-10 text-2xl font-bold">
                        Add Points
                    </h1>
                    <AddPoints/>
                </div>
            </div>
        </>
    )
}

export default Points;