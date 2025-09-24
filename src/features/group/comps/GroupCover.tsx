import { motion } from "framer-motion";
import React from "react";

type GroupCoverProps = {
  handleJoinGroup: () => void;
};

const GroupCover = ({ handleJoinGroup }: GroupCoverProps) => {
  // Sample profile data - you can replace these with real image URLs
  const profiles = [
    {
      id: 1,
      name: "Creator 1",
      avatar:
        "https://images.unsplash.com/photo-1723109438209-2f6402e08c7c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bnVkZXxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      id: 2,
      name: "Creator 2",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Creator 3",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Creator 4",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Creator 5",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 6,
      name: "Creator 6",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 7,
      name: "Creator 7",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 8,
      name: "Creator 8",
      avatar:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 9,
      name: "Creator 9",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 10,
      name: "Creator 10",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 11,
      name: "Creator 11",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 12,
      name: "Creator 12",
      avatar:
        "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 13,
      name: "Creator 13",
      avatar:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 14,
      name: "Creator 14",
      avatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 15,
      name: "Creator 15",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 16,
      name: "Creator 16",
      avatar:
        "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 17,
      name: "Creator 17",
      avatar:
        "https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 18,
      name: "Creator 18",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 19,
      name: "Creator 19",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 20,
      name: "Creator 20",
      avatar:
        "https://images.unsplash.com/photo-1558203728-00f45181dd84?w=150&h=150&fit=crop&crop=face",
    },
  ];

  // Function to calculate position for circular arrangement
  const getCircularPosition = (
    index: number,
    total: number,
    radius: number,
    centerX = 0,
    centerY = 0,
  ) => {
    const angle = (index * 2 * Math.PI) / total;
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  // Arrange profiles in multiple concentric circles
  const arrangeProfiles = () => {
    const arranged = [];
    const centerProfile = profiles[0];

    // Center profile
    arranged.push({
      ...centerProfile,
      style: {
        transform: "translate(-50%, -50%)",
        left: "50%",
        top: "50%",
      },
      size: "w-16 h-16",
    });

    // Inner circle (6 profiles)
    const innerCircle = profiles.slice(1, 7);
    innerCircle.forEach((profile, index) => {
      const pos = getCircularPosition(index, 6, 60);
      arranged.push({
        ...profile,
        style: {
          transform: "translate(-50%, -50%)",
          left: `calc(50% + ${pos.x}px)`,
          top: `calc(50% + ${pos.y}px)`,
        },
        size: "w-12 h-12",
      });
    });

    // Outer circle (remaining profiles)
    const outerCircle = profiles.slice(7);
    outerCircle.forEach((profile, index) => {
      const pos = getCircularPosition(index, outerCircle.length, 120);
      arranged.push({
        ...profile,
        style: {
          transform: "translate(-50%, -50%)",
          left: `calc(50% + ${pos.x}px)`,
          top: `calc(50% + ${pos.y}px)`,
        },
        size: "w-10 h-10",
      });
    });

    return arranged;
  };

  const arrangedProfiles = arrangeProfiles();

  return (
    <div className="min-h-dvh">
      <div className="flex items-center justify-center w-full overflow-hidden bg-white dark:bg-black h-dvh">
        {/* Main content */}
        <div className="px-8 py-8 text-center">
          {/* Title */}
          <h1 className="mb-8 text-2xl font-black tracking-tight text-center text-black md:text-4xl dark:text-white">
            CREATORS GROUP
          </h1>

          {/* Circular profile arrangement */}
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            animate={{ rotate: 360 }}
            transition={{
              rotate: {
                duration: 20,
                ease: "linear",
                repeat: Infinity,
              },
            }}
            className="relative mx-auto"
            style={{ width: "300px", height: "300px" }}
          >
            {arrangedProfiles.map((profile, index) => (
              <div
                key={profile.id}
                className="absolute select-none"
                style={profile.style}
              >
                <motion.img
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
                  transition={{
                    rotate: {
                      duration: 15,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                  src={profile.avatar}
                  alt={profile.name}
                  className={`${profile.size} rounded-full object-cover border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer`}
                />
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <div className="mt-8 mb-8">
            <p className="max-w-xl font-medium leading-relaxed text-center text-gray-800 dark:text-white">
              Join the Paymefans Creator Group to connect with fellow creators
              and models worldwide, explore collaboration opportunities, and
              build business relationships.
            </p>
          </div>

          {/* Join button */}
          <button
            onClick={handleJoinGroup}
            className="px-8 py-4 text-lg font-semibold text-white rounded-full cursor-pointer w-96  bg-primary-dark-pink hover:bg-gray-800 transition-colors duration-200 active:scale-95 transform"
          >
            Join Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCover;
