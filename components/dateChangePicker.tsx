"use client";
import{useState} from "react";
import { FiChevronLeft } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "lucide-react";
const DateChangePicker = () => {
  const [date, setDate] = useState<any>(null);
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate || null);
    
    
  };

return (
    <>
      <div className="flex justify-between  items-center">
        <h4 className="font-[600px] font-geist text-[18px] text-black text-center  flex justify-center">
          All Task
        </h4>
        <div>
          <div className="flex space-x-2">
            <button className="flex w-10 h-10    justify-center items-center gap-[6px] rounded-[10px] border border-zinc-300 bg-white">
            <FiChevronLeft  className="w-6 h-6"/>
            </button>
            <div>
              <Popover>
                <PopoverTrigger asChild>
              <button className="flex w-[110px] h-[40px] py-3 px-4 font-geist p-[8px_13px] justify-center items-center gap-[6px] rounded-[10px] border border-zinc-300 bg-white text-[#09090B]">
                <Calendar className="w-4 h-4"/>
              </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                      {/* <Calendar
                        mode="single"
                        selected={date}
                        // onSelect={handleDateChange}
                        initialFocus
                      /> */}11 Dec 2024 
                    </PopoverContent>
              </Popover>
            </div>
            <div>
              <button className="flex w-10 h-10    justify-center items-center gap-[6px] rounded-[10px] border border-zinc-300 bg-white">
              <FiChevronRight  className="w-6 h-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
)
}
export default DateChangePicker;