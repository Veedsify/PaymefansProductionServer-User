export function formatDate(date: any): string {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // Difference in seconds

    if (diff < 60) {
        return 'just now';
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400 && now.getDate() === date.getDate()) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        // Calculate the difference in days
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfGivenDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayDiff = Math.floor((startOfToday.getTime() - startOfGivenDay.getTime()) / 86400000);

        if (dayDiff === 0) {
            const hours = Math.floor(diff / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }

        return `${dayDiff} day${dayDiff !== 1 ? 's' : ''} ago`;
    }
}
