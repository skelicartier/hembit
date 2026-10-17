import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSeries = searchParams.get('series') || '';
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    const query = new URLSearchParams();
    if (currentCategory) query.set('category', currentCategory);
    if (currentSeries) query.set('series', currentSeries);
    if (currentSearch) query.set('search', currentSearch);

    setLoading(true);
    api
      .get(`/public/shop?${query.toString()}`)
      .then((response) => setData(response))
      .finally(() => setLoading(false));
  }, [currentCategory, currentSeries, currentSearch]);

  const seriesOptions = useMemo(() => {
    const selectedCategory = data.categories.find((category) => category.slug === currentCategory);
    return selectedCategory?.series || [];
  }, [currentCategory, data.categories]);

  // Find the display name for the current category
  const selectedCategory = data.categories.find((category) => category.slug === currentCategory);
  const displayCategory = selectedCategory ? selectedCategory.name : "MEN";

  const count = String(data.products.length).padStart(2, '0');

  return (
    <div className="shop-page">
      <header className="shop-head">
        <div className="shop-head-top">
          <span className="shop-head-label">
            {currentSearch ? 'SEARCH RESULTS' : `CATALOG — ${displayCategory.toUpperCase()}`}
          </span>
          <span className="shop-head-count">[{count}]</span>
        </div>
        <h1>{currentSearch ? `“${currentSearch}”` : displayCategory}</h1>

        <div className="shop-filters">
          {currentSearch ? (
            <button type="button" className="shop-clear-search" onClick={() => setSearchParams({})}>
              CLEAR SEARCH
            </button>
          ) : seriesOptions.length > 0 ? (
            <>
              <button
                type="button"
                className={`shop-filter${!currentSeries ? ' shop-filter--active' : ''}`}
                onClick={() => setSearchParams(currentCategory ? { category: currentCategory } : {})}
              >
                ALL
              </button>
              {seriesOptions.map((series) => (
                <button
                  key={series.id}
                  type="button"
                  className={`shop-filter${currentSeries === series.slug ? ' shop-filter--active' : ''}`}
                  onClick={() => setSearchParams({ category: currentCategory, series: series.slug })}
                >
                  {series.name}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </header>

      {loading ? (
        <div className="page-status">LOADING PRODUCTS</div>
      ) : data.products.length === 0 ? (
        <div className="page-status">NO PRODUCTS FOUND</div>
      ) : (
        <section className="shop-grid-wrap">
          <div className="product-grid">
            {data.products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
