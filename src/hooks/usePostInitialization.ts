import { useEffect } from 'react';
import { PostAudienceDataProps } from '@/types/Components';

interface UsePostInitializationProps {
    posts: any;
    setContent: (content: string) => void;
    setPostText: (text: string) => void;
    setVisibility: (visibility: "Public" | "Subscribers" | "Price") => void;
    setPostAudience: (audience: PostAudienceDataProps) => void;
    setEditedMedia: (media: any[]) => void;
    setPrice: (price: number) => void;
    setNairaDisplayValue: (value: string) => void;
    postAudienceData: PostAudienceDataProps[];
    config: any;
}

export const usePostInitialization = ({
    posts,
    setContent,
    setPostText,
    setVisibility,
    setPostAudience,
    setEditedMedia,
    setPrice,
    setNairaDisplayValue,
    postAudienceData,
    config,
}: UsePostInitializationProps) => {
    useEffect(() => {
        if (posts) {
            const existingContent = posts.content || '';
            setContent(existingContent);
            setPostText(existingContent);

            if (posts.post_audience) {
                let audienceName = posts.post_audience.toLowerCase();
                if (audienceName === 'price') {
                    audienceName = 'price';
                }
                const audience = postAudienceData.find(
                    (aud) => aud.name.toLowerCase() === audienceName,
                );
                if (audience) {
                    setVisibility(audience.name);
                    setPostAudience(audience);
                }
            }

            if (posts.UserMedia) {
                setEditedMedia(posts.UserMedia);
            }

            if (posts.post_price) {
                setPrice(posts.post_price);
                const nairaValue = config?.point_conversion_rate_ngn
                    ? Math.round(posts.post_price * config.point_conversion_rate_ngn)
                    : posts.post_price;
                setNairaDisplayValue(nairaValue.toString());
            }
        }
    }, [
        posts,
        setContent,
        setPostText,
        setVisibility,
        setPostAudience,
        setEditedMedia,
        setPrice,
        setNairaDisplayValue,
        postAudienceData,
        config,
    ]);

    const checkDateDiff = () => {
        if (!posts?.created_at) return false;
        const postDate = new Date(posts.created_at);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - postDate.getTime();
        return timeDiff > 86400000;
    };

    return { isOldPost: checkDateDiff() };
};