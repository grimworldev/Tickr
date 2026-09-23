// resources/js/components/pagination.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    links: PaginationLink[];
    siblingCount?: number;
};

type PageEntry =
    | { type: 'page'; page: number; url: string | null; active: boolean }
    | { type: 'ellipsis' };

function buildPageEntries(pageLinks: PaginationLink[], siblingCount: number): PageEntry[] {
    const total = pageLinks.length;
    const currentIndex = pageLinks.findIndex((l) => l.active);

    if (total <= 5 + siblingCount * 2) {
        // Small enough to just show every page, no truncation needed.
        return pageLinks.map((l, i) => ({
            type: 'page',
            page: i + 1,
            url: l.url,
            active: l.active,
        }));
    }

    const entries: PageEntry[] = [];
    const push = (i: number) =>
        entries.push({ type: 'page', page: i + 1, url: pageLinks[i].url, active: pageLinks[i].active });

    push(0); // always show first page

    const start = Math.max(1, currentIndex - siblingCount);
    const end = Math.min(total - 2, currentIndex + siblingCount);

    if (start > 1) entries.push({ type: 'ellipsis' });
    for (let i = start; i <= end; i++) push(i);
    if (end < total - 2) entries.push({ type: 'ellipsis' });

    push(total - 1); // always show last page

    return entries;
}

export function Pagination({ links, siblingCount = 1 }: Props) {
    if (links.length <= 3) return null; // only prev/next + 1 page — nothing to paginate

    const prevLink = links[0];
    const nextLink = links[links.length - 1];
    const pageLinks = links.slice(1, -1); // strip Laravel's "Previous"/"Next" entries, handle separately

    const entries = buildPageEntries(pageLinks, siblingCount);

    return (
        <div className="flex flex-wrap items-center justify-center gap-1">
            <Button variant="outline" size="sm" disabled={!prevLink.url} asChild={!!prevLink.url}>
                {prevLink.url ? (
                    <Link href={prevLink.url} preserveScroll>
                        Previous
                    </Link>
                ) : (
                    <span>Previous</span>
                )}
            </Button>

            {entries.map((entry, i) =>
                entry.type === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
                        …
                    </span>
                ) : (
                    <Button
                        key={entry.page}
                        variant={entry.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!entry.url}
                        asChild={!!entry.url}
                    >
                        {entry.url ? (
                            <Link href={entry.url} preserveScroll>
                                {entry.page}
                            </Link>
                        ) : (
                            <span>{entry.page}</span>
                        )}
                    </Button>
                ),
            )}

            <Button variant="outline" size="sm" disabled={!nextLink.url} asChild={!!nextLink.url}>
                {nextLink.url ? (
                    <Link href={nextLink.url} preserveScroll>
                        Next
                    </Link>
                ) : (
                    <span>Next</span>
                )}
            </Button>
        </div>
    );
}