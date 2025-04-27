export const acceptedBankCountries = [
  {
    name: "Nigeria",
    image: "",
    countryIso: "ng",
    bankType: "nuban",
  },
  {
    name: "Ghana",
    image: "",
    countryIso: "gh",
    bankType: "ghipss",
  },
  {
    name: "Kenya",
    image: "",
    countryIso: "ke",
    bankType: "kepss",
  },
  {
    name: "South Africa",
    image: "",
    countryIso: "za",
    bankType: "basa",
  },
];

export const acceptedBankTypes = {
  ng: [
    {
      name: "Bank",
      type: "nuban",
      countryIso: "ng",
      image: "/images/Nigeria.svg",
    },
  ],
  gh: [
    {
      name: "Bank",
      type: "ghipss",
      countryIso: "gh",
      image: "/images/Ghana.svg",
    },
    {
      name: "Mobile Money",
      type: "momo",
      countryIso: "gh",
      image: "/images/Mtn.jpg",
    },
  ],
  ke: [
    {
      name: "Bank",
      type: "kepss",
      countryIso: "ke",
      image: "/images/Kenya.svg",
    },
    {
      name: "M-Pesa",
      type: "mpesa",
      countryIso: "ke",
      image: "/images/vodacom.webp",
    },
  ],
  za: [
    {
      name: "Bank",
      type: "basa",
      countryIso: "za",
      image: "/images/SA.svg",
    },
    {
      name: "Mobile Money",
      type: "momo",
      countryIso: "za",
      image: "/images/Mtn.jpg",
    },
  ],
};
