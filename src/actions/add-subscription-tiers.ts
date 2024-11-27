"use server"
export default async function AddSubscriptionTiers(formData: FormData) {
     const names = formData.getAll('name[]');
     const prices = formData.getAll('price[]');
     const durations = formData.getAll('duration[]');
     const perks = formData.getAll('perks[]');

     // Combine into a structured array of objects
     const subscriptionTiers = names.map((_, index) => ({
          name: names[index],
          price: prices[index],
          duration: durations[index],
          perks: perks[index],
     }));
     
     console.log(subscriptionTiers)
}