import type { LinkItem } from '../../types'

export function RelatedBrands({ brands }: { brands: LinkItem[] }) {
  if (brands.length === 0) return null

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2.5">
        <span className="material-symbols-outlined text-blue-500 text-[20px]">sell</span>
        Related Brands
      </h3>
      <div className="flex flex-col gap-1">
        {brands.map((brand, i) => (
          <a
            key={`${brand.linked_id}-${i}`}
            href={`#entities/${brand.linked_id}`}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            <span className="material-symbols-outlined text-blue-400 text-[16px]">storefront</span>
            <span className="font-medium text-sm text-slate-900 group-hover:text-primary transition-colors truncate flex-1">
              {brand.linked_name}
            </span>
            <span className="text-[10px] text-slate-400 bg-gray-50 px-1.5 py-0.5 rounded shrink-0">
              {brand.link_type}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
