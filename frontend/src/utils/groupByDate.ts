export type GroupByDate<T>= {
  date: string;         
  items: T[]; 
};

export function groupByDate<T>( 
  list: T[],
  getDate: (item: T) => string,
  locale: string = "id-ID"
): GroupByDate<T>[] {
  const map = new Map<string, T[]>();

  for (const item of list) {
    const rawDate = getDate(item).slice(0, 10);
    const arr = map.get(rawDate) ?? [];
    arr.push(item);
    map.set(rawDate, arr);
  }

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1)) 
    .map(([rawDate, items]) => {
      const label = new Date(rawDate).toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return {
        date: label,
        items,
      };
    });
}
