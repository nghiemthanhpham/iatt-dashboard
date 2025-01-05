/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Loader } from "lucide-react"
import { OrderService } from "@/services/order"
import { ModalUpdateBlog } from "./modal.update"
import { HELPER } from "@/utils/helper"
import { AccountService } from "@/services/account"
import { ProductService } from "@/services/product"

export default function Order() {

    const COUNT = 6

    const [products, setProducts] = useState([] as any)
    const [accounts, setAccounts] = useState([] as any)
    const [data, setData] = useState([] as any)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [totalPage, setTotalPage] = useState<number>(0)
    const [currenPage, setCurrenPage] = useState<any>(1 as any)
    const [currenData, setCurrenData] = useState<any>([] as any)

    const selectPage = (pageSelected: any) => {
        setCurrenPage(pageSelected)
        const start = (pageSelected - 1) * COUNT
        const end = pageSelected * COUNT
        setCurrenData(data.slice(start, end))
    }

    const render = (data: any) => {
        setData(data)
        setTotalPage(Math.ceil(data.length / COUNT))
        setCurrenPage(1)
        setCurrenData(data.slice(0, COUNT))
    }

    const renderAccount = async () => {
        const res = await AccountService.getAll()
        if (res && res.data.length > 0) {
            setAccounts(res.data)
            setIsLoading(false)
        }
    }

    const renderProduct = async () => {
        const res = await ProductService.getAll()
        if (res && res.data.length > 0) {
            setProducts(res.data)
            setIsLoading(false)
        }
    }

    const renderOrder = async () => {
        const res = await OrderService.getAll()
        if (res && res.data.length > 0) {
            render(res.data)
            setIsLoading(false)
        }
    }

    const init = async () => {
        renderAccount()
        renderProduct()
        renderOrder()
    }

    useEffect(() => {
        init()
    }, [])

    useEffect(() => { }, [totalPage, isLoading, currenData, currenPage])

    return (
        <section className="p-4">
            <div className="relative overflow-hidden">
                <div className="flex">
                    <div className="flex items-start flex-1">
                        <h5>
                            <span className="text-gray-800 text-[20px] font-bold">DANH SÁCH ĐƠN HÀNG ({data?.length})</span>
                        </h5>
                    </div>
                </div>
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="w-64 px-4 py-3">Sản phẩm</th>
                                <th scope="col" className="w-40 px-4 py-3">Khách hàng</th>
                                <th scope="col" className="w-40 px-4 py-3">Địa chỉ</th>
                                <th scope="col" className="w-32 px-4 py-3">Trạng thái</th>
                                <th scope="col" className="w-32 px-4 py-3">Tổng</th>
                                <th scope="col" className="w-24 px-4 py-3">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currenData?.map((item: any, index: any) => {
                                    return (
                                        <tr key={index} className={`${item?.deleted_at ? 'hidden' : ''} border-b border-l border-r dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`}>
                                            <td className="w-64 px-4 py-2 flex items-center">
                                                <Image
                                                    src={item?.image}
                                                    alt="img"
                                                    className="w-auto h-20 mr-3"
                                                    width={100}
                                                    height={0}
                                                />
                                                <span className="text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                                                    {
                                                        products?.find((pro: any) => pro._id.toString() === item?.product_id)?.name
                                                    }
                                                </span>
                                            </td>
                                            <td className="w-40 px-4 py-2">
                                                <span className="text-[14px] bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                                                    {
                                                        accounts?.find((pro: any) => pro.email.toString() === item?.account_email)?.name
                                                    }
                                                </span>
                                            </td>
                                            <td className="w-40 px-4 py-2">
                                                <span className="text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                                                    {item?.address}
                                                </span>
                                            </td>
                                            <td className="w-32 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{HELPER.renderStatus(item?.status)}</td>
                                            <td className="w-32 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">{HELPER.formatVND(item?.total)}</td>
                                            <td className="w-24 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <ModalUpdateBlog data={item} />
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                {
                    isLoading
                        ?
                        <div className="w-full flex justify-center items-center pt-60">
                            <Loader className="animate-spin" size={48} />
                        </div>
                        :
                        <nav className="flex flex-col items-start justify-center mt-4 p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation">
                            <ul className="inline-flex items-stretch -space-x-px">
                                <li>
                                    <a href="#" className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                        <span className="sr-only">Previous</span>
                                        <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </li>
                                {
                                    Array.from({ length: totalPage }, (_, i) => i + 1)?.map((item: any, index: any) => {
                                        return (
                                            <li key={index} onClick={() => selectPage(item)}>
                                                <a href="#" className={`${item === currenPage ? 'bg-orange-100' : 'bg-white'} flex items-center justify-center px-3 py-2 text-sm leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}>
                                                    {item}
                                                </a>
                                            </li>
                                        )
                                    })
                                }
                                <li>
                                    <a href="#" className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                        <span className="sr-only">Next</span>
                                        <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                }
            </div>
        </section>
    )
}
