export interface Payment{
    id: string
    orderId: string
    method: string
    amount: number
    status: string
    createdAt: string
    updatedAt: string 
}