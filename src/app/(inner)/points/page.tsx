import PointsBuy from "@/components/sub_components/Points";
import getAllPoints from "@/utils/data/GetPoints";
import AddPoints from "@/components/points/AddPoints";

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
//                 <h1 className="font-bold text-2xl mb-10 pt-4">
//                     Points
//                 </h1>
//                 <div className="grid grid-cols-3 gap-3 md:gap-6 mb-20 md:mb-0">
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
                    <h1 className="font-bold text-2xl mb-10 pt-4">
                        Add Points
                    </h1>
                    <AddPoints/>
                </div>
            </div>
        </>
    )
}

export default Points;