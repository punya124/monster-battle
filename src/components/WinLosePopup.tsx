"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"; // adjust import to your file

type WinLosePopupProps = {
    imageUrl: string;
    name: string;
    result: "win" | "lose";
    className?: string;
};

export default function WinLosePopup({
    imageUrl,
    name,
    result,
    className,
}: WinLosePopupProps) {
    const router = useRouter();

    const isWin = result === "win";
    const borderColor = isWin ? "border-green-500" : "border-red-500";
    const glow = isWin
        ? "shadow-[0_0_30px_rgba(34,197,94,0.6)]"
        : "shadow-[0_0_30px_rgba(239,68,68,0.6)]";
    const title = isWin ? "You Win!" : "You Lose";

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
                className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <CardContainer containerClassName="w-full px-4">
                <CardBody
                    className={cn(
                        "max-w-md w-full rounded-xl bg-neutral-900 border-2",
                        borderColor,
                        glow,
                        "p-4 md:p-6"
                    )}
                >
                    <div className="flex flex-col items-center gap-4">
                        <CardItem
                            as="h2"
                            className={cn(
                                "text-2xl md:text-3xl font-semibold tracking-tight text-white"
                            )}
                            translateZ={30}
                        >
                            {title}
                        </CardItem>

                        <CardItem translateZ={50} className="rounded-lg overflow-hidden">
                            <Image
                                src={imageUrl}
                                alt={name}
                                width={320}
                                height={320}
                                className={cn(
                                    "h-48 w-48 md:h-56 md:w-56 object-cover rounded-lg border",
                                    borderColor
                                )}
                                priority
                            />
                        </CardItem>

                        <CardItem
                            as="p"
                            className="text-neutral-200 text-lg md:text-xl"
                            translateZ={20}
                        >
                            {name}
                        </CardItem>

                        <CardItem translateZ={16} className="mt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/collection")}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium",
                                    "bg-white text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300",
                                    "transition-colors border",
                                    borderColor
                                )}
                            >
                                Return
                            </button>
                        </CardItem>
                    </div>
                </CardBody>
            </CardContainer>
        </div>
    );
}
