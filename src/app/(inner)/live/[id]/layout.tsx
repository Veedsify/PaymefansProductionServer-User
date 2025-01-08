import { Metadata } from "next";
import { ReactNode } from "react";


export const metadata: Metadata = {
     title: "Live Stream",
     description: "Live Stream",
}

const LiveViewLayout = ({children}: {children: ReactNode}) => {
     return (
          <div>
               {children}
          </div>
     );
}

export default LiveViewLayout;
