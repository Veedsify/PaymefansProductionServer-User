"use client"
import { AuthUserProps, ProfileUserProps } from "@/types/user";
import { checkUserIsFollowing } from '@/utils/data/check-user-is-following';
import React, { useEffect } from 'react';
import FollowButton from "./sub/button";
import { socket } from "./sub/socket";

type FollowUserProps = {
    thisuser: AuthUserProps | null;
    profileuser: ProfileUserProps;
}

const FollowUserComponent: React.FC<FollowUserProps> = ({ profileuser, thisuser }) => {
    const [data, setData] = React.useState(false);
    const [followId, setFollowId] = React.useState<number | null>(null);
    useEffect(() => {
        socket.emit('checkUserIsFollowing', { user_id: profileuser.id, thisuser_id: thisuser?.id })
        socket.on('isFollowing', (data) => {
            setData(data.status);
            setFollowId(data.followID);
        })
        return () => {
            socket.off('isFollowing');
        }
    }, [profileuser, thisuser])
    return (
        <FollowButton
            setFollowId={setFollowId}
            followId={followId}
            users={{ profile_id: profileuser.id, user_id: thisuser?.id }}
            status={data}
            setstatus={setData} />
    );
}

export default FollowUserComponent;