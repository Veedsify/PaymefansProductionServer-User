import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface Message {
  id: number;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isSender: boolean;
}

const GroupMessageBubbles: React.FC = () => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Toggle dropdown visibility
  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(event.target as HTMLElement).closest(".option-button, .dropdown-menu")
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Sample messages data
  const messages: Message[] = [
    {
      id: 1,
      sender: "S",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Hey everyone, how's it going?",
      time: "10:00 AM",
      isSender: true,
    },
    {
      id: 2,
      sender: "R1",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Doing great! Just finished breakfast.",
      time: "10:02 AM",
      isSender: false,
    },
    {
      id: 3,
      sender: "R2",
      avatar:
        "https://images.pexels.com/photos/30610540/pexels-photo-30610540/free-photo-of-young-woman-in-red-dress-holding-flowers-and-flag.jpeg?auto=compress&cs=tinysrgb&w=600",
      text: "Same here! Ready for the day.",
      time: "10:03 AM",
      isSender: false,
    },
    {
      id: 4,
      sender: "S",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Awesome! Let's catch up later.",
      time: "10:05 AM",
      isSender: true,
    },
    {
      id: 5,
      sender: "S",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Hey everyone, how's it going?",
      time: "10:00 AM",
      isSender: true,
    },
    {
      id: 6,
      sender: "R1",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Doing great! Just finished breakfast.",
      time: "10:02 AM",
      isSender: false,
    },
    {
      id: 7,
      sender: "R2",
      avatar:
        "https://images.pexels.com/photos/30610540/pexels-photo-30610540/free-photo-of-young-woman-in-red-dress-holding-flowers-and-flag.jpeg?auto=compress&cs=tinysrgb&w=600",
      text: "Same here! Ready for the day.",
      time: "10:03 AM",
      isSender: false,
    },
    {
      id: 8,
      sender: "S",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Awesome! Let's catch up later.",
      time: "10:05 AM",
      isSender: true,
    },
    {
      id:9,
      sender: "S",
      avatar:
        "https://images.pexels.com/photos/20259613/pexels-photo-20259613/free-photo-of-model-in-dress-sitting-on-chair.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
      text: "Awesome! Let's catch up later.",
      time: "10:05 AM",
      isSender: true,
    },
  ];

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-end gap-3 ${message.isSender ? "justify-end" : "justify-start"}`}
        >
          {!message.isSender && (
            <Link href="/client/public">
              <Image
                width={40}
                height={40}
                src={message.avatar}
                alt={message.sender}
                className="w-10 h-10 rounded-full"
              />
            </Link>
          )}

          <div
            className={`relative max-w-xs p-4 ${message.isSender ? "rounded-br-none" : "rounded-bl-none"} rounded-2xl ${message.isSender ? "bg-primary-dark-pink text-white" : "bg-gray-200 text-gray-800"}`}
          >
            <p className="text-sm leading-tight">{message.text}</p>
            <div className="flex justify-between items-center mt-2 text-xs opacity-80">
              <span>{message.time}</span>
              <button
                className="option-button p-1 rounded-full hover:bg-gray-300 focus:outline-none"
                onClick={() => toggleDropdown(message.id)}
              >
                ⋮
              </button>
            </div>
            {openDropdownId === message.id && (
              <div className="dropdown-menu absolute z-50 right-0 mt-1 w-32 rounded-lg shadow-md bg-white py-1">
                <ul className="text-sm text-gray-700">
                  <li className="px-3 py-1 hover:bg-gray-100 cursor-pointer">
                    Forward
                  </li>
                  <li className="px-3 py-1 hover:bg-gray-100 cursor-pointer">
                    Message Info
                  </li>
                  <li className="px-3 py-1 text-red-500 hover:bg-red-100 cursor-pointer">
                    Delete
                  </li>
                </ul>
              </div>
            )}
          </div>

          {message.isSender && (
            <Link href="/client/public">
              <Image
                width={40}
                height={40}
                src={message.avatar}
                alt={message.sender}
                className="w-10 h-10 rounded-full"
              />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupMessageBubbles;
