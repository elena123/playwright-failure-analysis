import { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
  price: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const response = await fetch('/api/products', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: Product[] = await response.json()
        setProducts(data)
      } catch {
        if (!controller.signal.aborted) {
          setError('Could not load products.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadProducts()

    return () => controller.abort()
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <main>
      <h1>Product Catalog</h1>

      <label htmlFor="search">Search products</label>
      <input
        id="search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {loading && <p role="status">Loading products...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <ul aria-label="Products">
              {filteredProducts.map((product) => (
                <li key={product.id}>
                  {product.name} — {product.price.toFixed(2)} EUR
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}

export default App