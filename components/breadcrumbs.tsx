import {Breadcrumbs as BaseBreadcrumbs} from 'baseui/breadcrumbs';
import Link from 'next/link';
import {useStyletron} from 'baseui';

function capitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function Breadcrumbs({path}: {path: string}) {
  const [css, theme] = useStyletron();
  const pathArr = path.split('/').filter(Boolean).slice(0, 3); // Max 3 url segments (to hide /update/long-product-id)

  const wrapperStyle = css({
    paddingTop: theme.sizing.scale500,
    paddingBottom: theme.sizing.scale500,
    paddingLeft: theme.sizing.scale600,
    paddingRight: theme.sizing.scale600,
    ...theme.borders.border200,
    borderRadius: theme.borders.radius400,
    marginTop: theme.sizing.scale400,
    marginLeft: theme.sizing.scale400,
    marginRight: theme.sizing.scale400,
    marginBottom: theme.sizing.scale400,
  });

  const linkStyle = css({
    color: theme.colors.contentPrimary,
  });

  return (
    <div className={wrapperStyle}>
      <BaseBreadcrumbs>
        {pathArr.map((slug, idx) => {
          if (idx === pathArr.length - 1) {
            return <span key={slug}>{capitalize(slug)}</span>;
          }
          return (
            <Link key={slug} href={`/${pathArr.slice(0, idx + 1).join('/')}`} className={linkStyle}>
              {capitalize(slug)}
            </Link>
          );
        })}
      </BaseBreadcrumbs>
    </div>
  );
}
