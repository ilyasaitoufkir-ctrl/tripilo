export interface FlightLinks {
  google: string;
  skyscanner: string;
  kayak: string;
}

export interface HotelLinks {
  booking: string;
  hotels: string;
  trivago: string;
}

export const getFlightLinks = (
  from: string,
  to: string,
  departureDate: string,
  returnDate: string,
  persons: number,
): FlightLinks => {
  const fromEnc = encodeURIComponent(from);
  const toEnc = encodeURIComponent(to);
  const dep = departureDate.replace(/-/g, '');
  const ret = returnDate.replace(/-/g, '');

  return {
    google: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flüge von ${from} nach ${to}`)}&date=${departureDate}&return_date=${returnDate}&adults=${persons}&curr=EUR`,
    skyscanner: `https://www.skyscanner.de/transport/fluge/${fromEnc}/${toEnc}/${dep}/${ret}/?adults=${persons}&currency=EUR`,
    kayak: `https://www.kayak.de/flights/${fromEnc}-${toEnc}/${departureDate}/${returnDate}/${persons}adults`,
  };
};

export const getHotelLinks = (
  destination: string,
  checkin: string,
  checkout: string,
  persons: number,
): HotelLinks => {
  const dest = encodeURIComponent(destination);

  return {
    booking: `https://www.booking.com/search.html?ss=${dest}&checkin=${checkin}&checkout=${checkout}&group_adults=${persons}&selected_currency=EUR&order=price&lang=de`,
    hotels: `https://de.hotels.com/search.do?destination-id=&q-destination=${dest}&q-check-in=${checkin}&q-check-out=${checkout}&q-rooms=1&q-room-0-adults=${persons}&sort-order=RECOMMENDED`,
    trivago: `https://www.trivago.de/?aDateRange[arr]=${checkin}&aDateRange[dep]=${checkout}&iRoomType=7&iPersons=${persons}&sQuery=${dest}&iPathId=61`,
  };
};

// Fallback URLs when no dates are set
export const getFlightFallback = (to: string, persons: number) =>
  `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flüge nach ${to}`)}&adults=${persons}&curr=EUR`;

export const getHotelFallback = (destination: string, persons: number) =>
  `https://www.booking.com/search.html?ss=${encodeURIComponent(destination)}&group_adults=${persons}&selected_currency=EUR`;
