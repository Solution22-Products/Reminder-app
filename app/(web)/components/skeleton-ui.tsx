import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    height?: string;
    width?: string;
}

const DefaultSkeleton = () => {
  return (
    <main className="grid grid-flow-row auto-rows-max gap-3">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="grid-flow-col auto-cols-max gap-12">
          <Skeleton className="bg-gray-300 p-3 h-10 w-full">
            <div className="flex items-center justify-end">
              <Skeleton className="h-6 w-2 rounded -mt-1" />
            </div>
          </Skeleton>
        </div>
      ))}
    </main>
  );
};

const OverdueSkeleton = () => {
  return (
    <main className="flex justify-start items-center gap-5 overflow-hidden">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="flex flex-col items-center justify-evenly h-full">
          <Skeleton className="bg-gray-300 p-3 w-[207px] h-[156px]">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg my-3" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
            </div>
          </Skeleton>
        </div>
      ))}
    </main>
  );
};

const OverdueListSkeleton = () => {
  return (
    <main className="flex flex-col justify-start items-center gap-5 w-full">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((id) => (
        <div key={id} className="flex flex-col items-center justify-evenly h-full w-full">
          <Skeleton className="bg-gray-300 p-3 w-full h-[156px]">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg my-3" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
              <Skeleton className="h-6 w-1/2 rounded-lg -mt-1" />
            </div>
          </Skeleton>
        </div>
      ))}
    </main>
  );
};

export default DefaultSkeleton;
export { OverdueSkeleton, OverdueListSkeleton};