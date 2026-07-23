export const getActivityImage = (activity: string, destination: string): string => {
  const query = encodeURIComponent(`${activity} ${destination}`);
  return `https://source.unsplash.com/800x500/?${query},travel`;
};

export const getDestinationImage = (destination: string): string => {
  return `https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)},city,travel`;
};

export const getRestaurantImage = (name: string, destination: string): string => {
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(`${name} ${destination}`)},food,restaurant`;
};

export const getHotelImage = (destination: string): string => {
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(destination)},hotel,luxury`;
};
