"use client";
import { useSwipeable } from "react-swipeable";

const SwipeComponent = () => {
  // Define the swipeable handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => console.log("Swiped left!"),
    onSwipedRight: () => console.log("Swiped right!"),
    onSwipedUp: () => console.log("Swiped up!"),
    onSwipedDown: () => console.log("Swiped down!"),
    trackMouse: true, // Allows swiping with a mouse
  });

  return (
    <div
      {...handlers} // Spread the handlers here to make the div swipeable
      className="w-full h-40 bg-gray-200 flex items-center justify-center"
    >
      Swipe me!
    </div>
  );
};

export default SwipeComponent;
