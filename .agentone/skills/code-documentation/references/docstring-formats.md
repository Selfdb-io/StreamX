# Docstring Formats by Language

## Python

### Google Style (Recommended)

```python
def calculate_discount(price: float, discount_percent: float) -> float:
    """Calculate the discounted price.

    Args:
        price: Original price in dollars.
        discount_percent: Discount percentage (0-100).

    Returns:
        The price after applying the discount.

    Raises:
        ValueError: If discount_percent is not between 0 and 100.

    Example:
        >>> calculate_discount(100.0, 20)
        80.0
    """
```

### NumPy Style

```python
def calculate_discount(price, discount_percent):
    """
    Calculate the discounted price.

    Parameters
    ----------
    price : float
        Original price in dollars.
    discount_percent : float
        Discount percentage (0-100).

    Returns
    -------
    float
        The price after applying the discount.

    Raises
    ------
    ValueError
        If discount_percent is not between 0 and 100.

    Examples
    --------
    >>> calculate_discount(100.0, 20)
    80.0
    """
```

### Class Documentation

```python
class ShoppingCart:
    """A shopping cart that holds items and calculates totals.

    Attributes:
        items: List of items in the cart.
        discount_code: Optional discount code applied.

    Example:
        >>> cart = ShoppingCart()
        >>> cart.add_item("Widget", 29.99)
        >>> cart.total
        29.99
    """
```

---

## JavaScript / TypeScript (JSDoc)

### Function

```javascript
/**
 * Calculate the discounted price.
 * @param {number} price - Original price in dollars.
 * @param {number} discountPercent - Discount percentage (0-100).
 * @returns {number} The price after applying the discount.
 * @throws {RangeError} If discountPercent is not between 0 and 100.
 * @example
 * calculateDiscount(100, 20); // Returns 80
 */
function calculateDiscount(price, discountPercent) {
```

### TypeScript with Types

```typescript
/**
 * Calculate the discounted price.
 * @param price - Original price in dollars.
 * @param discountPercent - Discount percentage (0-100).
 * @returns The price after applying the discount.
 * @example
 * calculateDiscount(100, 20); // Returns 80
 */
function calculateDiscount(price: number, discountPercent: number): number {
```

### Class

```javascript
/**
 * A shopping cart that holds items and calculates totals.
 * @class
 * @property {Array<Item>} items - List of items in the cart.
 * @property {string|null} discountCode - Optional discount code applied.
 */
class ShoppingCart {
```

---

## Java (Javadoc)

```java
/**
 * Calculate the discounted price.
 *
 * @param price Original price in dollars
 * @param discountPercent Discount percentage (0-100)
 * @return The price after applying the discount
 * @throws IllegalArgumentException if discountPercent is not between 0 and 100
 */
public double calculateDiscount(double price, double discountPercent) {
```

### Class

```java
/**
 * A shopping cart that holds items and calculates totals.
 *
 * <p>Example usage:
 * <pre>{@code
 * ShoppingCart cart = new ShoppingCart();
 * cart.addItem("Widget", 29.99);
 * double total = cart.getTotal();
 * }</pre>
 *
 * @author Developer Name
 * @version 1.0
 * @since 2024-01-01
 */
public class ShoppingCart {
```

---

## Go (Godoc)

```go
// CalculateDiscount returns the price after applying a discount.
// The discountPercent must be between 0 and 100.
//
// Example:
//
//	price := CalculateDiscount(100.0, 20)
//	// price == 80.0
func CalculateDiscount(price, discountPercent float64) (float64, error) {
```

### Package

```go
// Package cart provides shopping cart functionality for e-commerce applications.
//
// Basic usage:
//
//	c := cart.New()
//	c.AddItem("Widget", 29.99)
//	total := c.Total()
package cart
```

---

## Rust

```rust
/// Calculate the discounted price.
///
/// # Arguments
///
/// * `price` - Original price in dollars
/// * `discount_percent` - Discount percentage (0-100)
///
/// # Returns
///
/// The price after applying the discount.
///
/// # Errors
///
/// Returns an error if `discount_percent` is not between 0 and 100.
///
/// # Examples
///
/// ```
/// let result = calculate_discount(100.0, 20.0)?;
/// assert_eq!(result, 80.0);
/// ```
pub fn calculate_discount(price: f64, discount_percent: f64) -> Result<f64, DiscountError> {
```

---

## C# (XML Documentation)

```csharp
/// <summary>
/// Calculate the discounted price.
/// </summary>
/// <param name="price">Original price in dollars.</param>
/// <param name="discountPercent">Discount percentage (0-100).</param>
/// <returns>The price after applying the discount.</returns>
/// <exception cref="ArgumentOutOfRangeException">
/// Thrown when discountPercent is not between 0 and 100.
/// </exception>
/// <example>
/// <code>
/// var discounted = CalculateDiscount(100.0, 20.0);
/// // discounted == 80.0
/// </code>
/// </example>
public double CalculateDiscount(double price, double discountPercent)
```

---

## Ruby (YARD)

```ruby
# Calculate the discounted price.
#
# @param price [Float] Original price in dollars
# @param discount_percent [Float] Discount percentage (0-100)
# @return [Float] The price after applying the discount
# @raise [ArgumentError] if discount_percent is not between 0 and 100
# @example
#   calculate_discount(100.0, 20) #=> 80.0
def calculate_discount(price, discount_percent)
```

---

## PHP (PHPDoc)

```php
/**
 * Calculate the discounted price.
 *
 * @param float $price Original price in dollars
 * @param float $discountPercent Discount percentage (0-100)
 * @return float The price after applying the discount
 * @throws InvalidArgumentException if discountPercent is not between 0 and 100
 *
 * @example
 * $discounted = calculateDiscount(100.0, 20);
 * // $discounted === 80.0
 */
function calculateDiscount(float $price, float $discountPercent): float
```
