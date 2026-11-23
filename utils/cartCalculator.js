export const calculateCartTotals = (items) => {
    let subtotal = 0;
    let discount = 0;

    const calculatedItems = items.map((item) => {
        const product = item.product;

        const itemSubtotal = product.price * item.quantity;

        const itemDiscount =
            (itemSubtotal * product.discount) / 100;

        const itemTotal = itemSubtotal - itemDiscount;

        subtotal += itemSubtotal;
        discount += itemDiscount;

        return {
            product: product._id,
            name: product.name,
            price: product.price,
            discountPercentage: product.discount,
            quantity: item.quantity,
            itemSubtotal,
            itemDiscount,
            itemTotal,
        };
    });

    const total = subtotal - discount;

    return {
        items: calculatedItems,
        subtotal,
        discount,
        total,
    };
};