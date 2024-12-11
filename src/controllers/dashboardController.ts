import { RequestHandler } from "express"
import prisma from "../../prisma/client"

const getTopSellingProducts: RequestHandler = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query // Optional query parameter to limit results, default is 10

    // Fetch top-selling products
    const topSellingProducts = await prisma.order.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true, // Sum of quantities for each product
      },
      orderBy: {
        _sum: {
          quantity: "desc", // Sort by total quantity sold in descending order
        },
      },
      take: Number(limit), // Limit the number of results
    })

    // Enrich the product data with additional details
    const productsWithDetails = await Promise.all(
      topSellingProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            category: true,
            images: true,
          },
        })

        return {
          product,
          totalSold: item._sum.quantity, // Include the total quantity sold
        }
      })
    )

    res.success(
      "Top selling products fetched successfully",
      productsWithDetails
    )
  } catch (error) {
    next(error)
  }
}

const recentOrders: RequestHandler = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10 // Default to 10 orders

    const recentOrders = await prisma.order.findMany({
      take: limit, // Limit the number of records fetched
      orderBy: {
        createdDT: "desc", // Sort by creation date in descending order
      },
      include: {
        user: {
          // Include user details
          select: {
            fullName: true, // Get full name of the user
          },
        },
        product: {
          // Include product details
          select: {
            name: true, // Product name
            price: true, // Product price
          },
        },
      },
    })

    // Map the order data to include necessary fields
    const mappedOrders = recentOrders.map((order) => ({
      orderId: order.id,
      customerName: order.user.fullName,
      productName: order.product.name,
      orderPrice: order.product.price * order.quantity, // Calculate total price
      orderStatus: order.status,
      orderDate: order.createdDT,
    }))

    res.success("Recent orders fetched successfully", mappedOrders)
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    next(error)
  }
}

const getSummary: RequestHandler = async (req, res, next) => {
  try {
    // Total number of customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: "user",
      },
    })

    // Total profit: Sum of the order price * quantity for orders with status 'Paid'
    const totalProfit = await prisma.order.aggregate({
      _sum: {
        quantity: true, // sum of quantity to get total units sold
      },
      where: {
        status: "Paid", // Only paid orders
      },
    })

    // Calculate the total profit by multiplying the total quantity with the product price
    const paidOrders = await prisma.order.findMany({
      where: { status: "Paid" },
      include: {
        product: true, // Include product to access its price
      },
    })

    // Calculate total profit from paid orders
    const totalProfitAmount = paidOrders.reduce(
      (acc, order) => acc + order.product.price * order.quantity,
      0
    )

    // Total number of orders
    const totalOrders = await prisma.order.count()

    // Send the summary response
    res.success("Summary fetched successfully", {
      totalCustomers,
      totalProfit: totalProfitAmount, // Total profit calculated
      totalOrders,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    next(error)
  }
}

export default { getTopSellingProducts, recentOrders, getSummary }
