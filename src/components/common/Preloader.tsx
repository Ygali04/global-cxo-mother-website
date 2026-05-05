"use client";
import { useEffect, useState } from "react";

const Preloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="preloader-wrapper">
            <div className="preloader-inner">
                <div className="preloader-spinner"></div>
            </div>
        </div>
    );
};

export default Preloader;
