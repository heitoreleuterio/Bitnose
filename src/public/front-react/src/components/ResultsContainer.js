import React from "react";
import { Link } from "react-router-dom";


export default function ResultsContainer(props) {
    return (
        <div className="itens-container">
            {props.results.map((item, index) => {
                let titleText =
                    [...item.title]
                        .filter((char, index) => index <= 175)
                        .reduce((str1, str2) => str1 + str2)
                    + (item.title.length > 175 ? "..." : "");

                return (
                    <div key={`result-${index}`} className="item-container">
                        <img className="item-image" src={item.imageSrc} referrerPolicy="no-referrer" />
                        <h3 className="item-title">{titleText}</h3>
                        <div className="buy-container">
                            <h4 className="item-price">{
                                item.price != null
                                    ? item.currency + item.price.toLocaleString("pt-BR")
                                    : "See Website for Price"}
                            </h4>
                            <Link className="item-button" to={item.url} target="_blank">Check product</Link>
                        </div>
                    </div>
                );
            }
            )}
        </div>
    );
}