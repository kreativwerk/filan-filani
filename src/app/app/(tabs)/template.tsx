/* Slide-Übergang: das Template wird pro Navigation neu gemountet und
   schiebt den neuen Seiteninhalt weich herein — das Menü im Layout bleibt stehen. */
export default function FFPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="ff-page-in flex min-w-0 flex-1 flex-col">{children}</div>;
}
