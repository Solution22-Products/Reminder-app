
interface Task {
    id: number;
    taskname: string;
    value: string;
}

export default function TaskCard({ item }: { item: Task }) {
    console.log(item)
    return (
        <div className="rounded-xl bg-white shadow w-2/6" key={item.id}>
            <div className="flex flex-col items-center h-[110.33px] w-[88px]  rounded-[14px] justify-evenly">
                <p className="text-[12px] font-[600] text-black">
                    {item.taskname}
                </p>
                <p className="text-[#14B8A6] text-xl font-bold">{item.value}</p>
            </div>
        </div>
    )
}