"use client"
import { FaMoneyBillWave, FaShoppingBag, FaUtensils, FaTruck, FaDollarSign } from 'react-icons/fa';

const Cards = ({ cards }) => {
  const icons = {
    'Total Sales': <FaMoneyBillWave className="text-[#F0364D]" size={35} />,
    'Total Orders': <FaShoppingBag className="text-yellow-500" size={35} />,
    'Pending Orders': <FaUtensils className="text-green-500" size={35} />,
    'Delivered Orders': <FaTruck className="text-purple-500" size={35} />,
    'Today Orders': <FaDollarSign className="text-blue-500" size={35} />,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4">
      {cards.map((card, index) => (
        <div key={index} className={`p-4 rounded-lg flex flex-col  shadow-md ${card.color} hover:translate-y-1`}>
          <div className="flex items-center  space-x-2 mb-2">
            {icons[card.title]}
          </div>
          <p className="text-lg font-semibold text-black">{card.title}</p>
          <p className="text-2xl font-bold mt-2 text-black">{card.value.toFixed(2)}</p>
          <p className="text-sm text-[#5a46cf]">{card.change}</p>
        </div>
      ))}
    </div>
  );
};

export default Cards;
