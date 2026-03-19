export async function getServerSideProps({ res }) {
  const body = `User-agent: *\nAllow: /\n\nSitemap: https://www.disbumply.pl/sitemap.xml\n`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
