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

export default { getTopSellingProducts }
