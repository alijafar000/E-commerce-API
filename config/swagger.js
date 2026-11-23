import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
            description:
                'Complete REST API documentation for E-commerce backend — Auth, Products, Cart, Orders, Payments, Reviews & Wishlist.',
            contact: {
                name: 'API Support',
                email: 'support@ecommerce.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Local Development Server'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Authentication & Authorization APIs' },
            { name: 'Products', description: 'Product management APIs' },
            { name: 'Cart', description: 'Shopping cart APIs' },
            { name: 'Orders', description: 'Order management APIs' },
            { name: 'Payments', description: 'Razorpay payment APIs' },
            { name: 'Reviews', description: 'Product review APIs' },
            { name: 'Wishlist', description: 'User wishlist APIs' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/login'
                }
            },
            schemas: {
                // ===================== AUTH =====================
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', minLength: 3, maxLength: 20, example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: { type: 'string', minLength: 6, example: 'Pass@123' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: { type: 'string', example: 'Pass@123' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        role: { type: 'string', enum: ['user', 'admin', 'seller'], example: 'user' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },

                // ===================== PRODUCT =====================
                Product: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'iPhone 15' },
                        description: { type: 'string', example: 'Latest Apple iPhone' },
                        price: { type: 'number', example: 79999 },
                        discount: { type: 'number', example: 10 },
                        category: { type: 'string', example: 'Electronics' },
                        brand: { type: 'string', example: 'Apple' },
                        stock: { type: 'number', example: 50 },
                        images: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    url: { type: 'string' },
                                    publicId: { type: 'string' }
                                }
                            }
                        },
                        rating: { type: 'number', example: 4.5 },
                        numReviews: { type: 'number', example: 120 },
                        seller: { type: 'string' },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateProductRequest: {
                    type: 'object',
                    required: ['name', 'description', 'price', 'category', 'brand', 'stock'],
                    properties: {
                        name: { type: 'string', example: 'iPhone 15' },
                        description: { type: 'string', example: 'Latest Apple iPhone' },
                        price: { type: 'number', example: 79999 },
                        discount: { type: 'number', example: 10 },
                        category: { type: 'string', example: 'Electronics' },
                        brand: { type: 'string', example: 'Apple' },
                        stock: { type: 'number', example: 50 }
                    }
                },
                UpdateProductRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        discount: { type: 'number' },
                        category: { type: 'string' },
                        brand: { type: 'string' },
                        stock: { type: 'number' }
                    }
                },

                // ===================== CART =====================
                AddToCartRequest: {
                    type: 'object',
                    required: ['productId', 'quantity'],
                    properties: {
                        productId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        quantity: { type: 'integer', minimum: 1, example: 2 }
                    }
                },
                UpdateCartQuantityRequest: {
                    type: 'object',
                    required: ['quantity'],
                    properties: {
                        quantity: { type: 'integer', minimum: 1, example: 5 }
                    }
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        product: { $ref: '#/components/schemas/Product' },
                        quantity: { type: 'number', example: 2 }
                    }
                },
                Cart: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CartItem' }
                        },
                        totals: {
                            type: 'object',
                            properties: {
                                subtotal: { type: 'number', example: 159998 },
                                discount: { type: 'number', example: 15999.8 },
                                total: { type: 'number', example: 143998.2 }
                            }
                        }
                    }
                },

                // ===================== ORDER =====================
                ShippingAddress: {
                    type: 'object',
                    required: ['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode'],
                    properties: {
                        fullName: { type: 'string', example: 'John Doe' },
                        phone: { type: 'string', example: '9876543210' },
                        addressLine: { type: 'string', example: '123 MG Road' },
                        city: { type: 'string', example: 'Bangalore' },
                        state: { type: 'string', example: 'Karnataka' },
                        postalCode: { type: 'string', example: '560001' },
                        country: { type: 'string', example: 'India', default: 'India' }
                    }
                },
                CreateOrderRequest: {
                    type: 'object',
                    required: ['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode'],
                    properties: {
                        fullName: { type: 'string', example: 'John Doe' },
                        phone: { type: 'string', example: '9876543210' },
                        addressLine: { type: 'string', example: '123 MG Road' },
                        city: { type: 'string', example: 'Bangalore' },
                        state: { type: 'string', example: 'Karnataka' },
                        postalCode: { type: 'string', example: '560001' },
                        country: { type: 'string', example: 'India' }
                    }
                },
                OrderItem: {
                    type: 'object',
                    properties: {
                        product: { type: 'string' },
                        name: { type: 'string', example: 'iPhone 15' },
                        price: { type: 'number', example: 79999 },
                        quantity: { type: 'number', example: 2 },
                        subtotal: { type: 'number', example: 143998.2 }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/OrderItem' }
                        },
                        shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
                        subtotal: { type: 'number', example: 159998 },
                        discount: { type: 'number', example: 15999.8 },
                        total: { type: 'number', example: 143998.2 },
                        paymentMethod: { type: 'string', enum: ['COD', 'ONLINE'] },
                        paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
                        orderStatus: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
                        },
                        inventoryStatus: {
                            type: 'string',
                            enum: ['not_reserved', 'reserved', 'committed', 'released']
                        },
                        razorpayOrderId: { type: 'string', nullable: true },
                        razorpayPaymentId: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                UpdateOrderStatusRequest: {
                    type: 'object',
                    required: ['orderStatus'],
                    properties: {
                        orderStatus: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
                            example: 'shipped'
                        }
                    }
                },

                // ===================== PAYMENT =====================
                CreateRazorpayOrderRequest: {
                    type: 'object',
                    required: ['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode'],
                    properties: {
                        fullName: { type: 'string', example: 'John Doe' },
                        phone: { type: 'string', example: '9876543210' },
                        addressLine: { type: 'string', example: '123 MG Road' },
                        city: { type: 'string', example: 'Bangalore' },
                        state: { type: 'string', example: 'Karnataka' },
                        postalCode: { type: 'string', example: '560001' },
                        country: { type: 'string', example: 'India' }
                    }
                },
                VerifyRazorpayPaymentRequest: {
                    type: 'object',
                    required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
                    properties: {
                        razorpay_order_id: { type: 'string', example: 'order_Nxxxxx' },
                        razorpay_payment_id: { type: 'string', example: 'pay_Nxxxxx' },
                        razorpay_signature: { type: 'string', example: 'hex_signature' }
                    }
                },

                // ===================== REVIEW =====================
                AddReviewRequest: {
                    type: 'object',
                    required: ['rating', 'comment'],
                    properties: {
                        rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                        comment: { type: 'string', minLength: 3, maxLength: 1000, example: 'Great product!' }
                    }
                },
                Review: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        product: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                name: { type: 'string' }
                            }
                        },
                        rating: { type: 'number', example: 5 },
                        comment: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },

                // ===================== WISHLIST =====================
                Wishlist: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user: { type: 'string' },
                        products: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Product' }
                        }
                    }
                },

                // ===================== COMMON =====================
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Something went wrong' }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js']
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec