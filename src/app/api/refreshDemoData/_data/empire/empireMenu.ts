import mongoose from "mongoose";
import type { TMenu } from "#utils/database/models/menu";
import { ID_SUFFIX, REF_EMPIRE, TYPE_MENU } from "../constants";

const empireBox = [
	{
		name: "Chicken Karahi Rice Box",
		description: "Ghee Rice, Butter Chicken Boneless (5 Pcs), Manchurian Dry (5 Pcs)",
		category: "Empire Box",
		price: 950,
		foodType: "spicy",
		veg: "non-veg",
		image: "https://b.zmtcdn.com/data/dish_photos/3c1/7394ef6f5086c3b3c4b17130995d33c1.jpg",
	},
	{
		name: "Daal Chawal Box",
		description: "Ghee Rice, Dal Fry",
		category: "Empire Box",
		price: 1400,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/5fc/dff6a95626a60b75c7de72055f0b15fc.png",
	},
	{
		name: "Chicken Biryani Box",
		description: "Biriyani Rice, Raitha, Chilly Chicken Boneless (5 Pcs)",
		category: "Empire Box",
		price: 750,
		foodType: "extra-spicy",
		veg: "non-veg",
		image: "https://b.zmtcdn.com/data/dish_photos/e70/85ec2da1cdb0c37a01bf4f345979de70.jpg",
	},
	{
		name: "Chicken Fried Rice Box",
		description: "Veg Fried Rice, Gobi Manchurian",
		category: "Empire Box",
		price: 950,
		foodType: "spicy",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/b95/bffa32a74a9c20e1a5831edc57cd5b95.png",
	},
];

const rice = [
	{
		name: "Mutton Biryani",
		description: null,
		category: "Biryani And Rice",
		price: 1400,
		foodType: "spicy",
		veg: "non-veg",
		image: "https://b.zmtcdn.com/data/dish_photos/280/2112a1536b75e649b09d84fce0eef280.jpg",
	},
	{
		name: "Chicken Biryani",
		description: null,
		category: "Biryani And Rice",
		price: 850,
		foodType: "spicy",
		veg: "contains-egg",
		image: "https://b.zmtcdn.com/data/dish_photos/071/95e4aa6e1a4688feda7257c75a198071.jpg",
	},
	{
		name: "Chicken Biryani",
		description: null,
		category: "Biryani And Rice",
		price: 550,
		foodType: "spicy",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/463/d31313b7b0e3317438bad307efc21463.jpg",
	},
	{
		name: "Chicken Pulao",
		description: null,
		category: "Biryani And Rice",
		price: 600,
		foodType: "sweet",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/bba/a8592bf0db3405112f7393fc56623bba.jpg",
	},
];

const mainCourse = [
	{
		name: "Chicken Karahi Dry",
		description: null,
		category: "Main Course",
		price: 250,
		foodType: "spicy",
		veg: "non-veg",
		image: "https://b.zmtcdn.com/data/dish_photos/a90/e90722778c19c42a5195cb35ca86fa90.jpg",
	},
	{
		name: "Mutton Karahi",

		description: null,
		category: "Main Course",
		price: 250,
		foodType: "extra-spicy",
		veg: "non-veg",
		image: "https://b.zmtcdn.com/data/dish_photos/a90/e90722778c19c42a5195cb35ca86fa90.jpg",
	},
	{
		name: "Mixed Vegetable Handi",
		description: null,
		category: "Main Course",
		price: 450,
		foodType: "spicy",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/955/b12cb13c87a4752ba8d2e8ec1f4b8955.jpg",
	},
	{
		name: "Chicken Tikka Masala",
		description: null,
		category: "Main Course",
		price: 900,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/9cb/978cc7cb973723c3bda2e3d2707a49cb.jpg",
	},
];

const eggDishes = [
	{
		name: "Boiled Eggs",
		description: null,
		category: "Egg Dishes",
		price: 650,
		foodType: null,
		veg: "contains-egg",
		image: "https://b.zmtcdn.com/data/dish_photos/c9a/cfc0c8d10f678de0ab7f36bb79c6fc9a.jpg",
	},
	{
		name: "Anda Fry",
		description: null,
		category: "Egg Dishes",
		price: 750,
		foodType: "spicy",
		veg: "contains-egg",
		image: "https://b.zmtcdn.com/data/dish_photos/22f/15f4dd017b5ca2f46bd0f55fa55dd22f.jpg",
	},
	{
		name: "Anda Masala",

		description: null,
		category: "Egg Dishes",
		price: 1100,
		foodType: "spicy",
		veg: "contains-egg",
		image: "https://b.zmtcdn.com/data/dish_photos/a50/75461abff94269645ef85d57cf908a50.jpg",
	},
];

const friedRice = [
	{
		name: "Chicken Fried Rice",
		description: null,
		category: "Fried Rice and Noodles",
		price: 650,
		foodType: "spicy",
		veg: "non-veg",
		image: "https://b.zmtcdn.com/data/dish_photos/a57/2665a52529b343d63966684f30ffba57.jpg",
	},
	{
		name: "Vegetable Fried Rice",
		description: null,
		category: "Fried Rice and Noodles",
		price: 850,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/901/1767d538164bf58f15c00d37e7197901.jpg",
	},
	{
		name: "Chicken Chow Mein",
		description: null,
		category: "Fried Rice and Noodles",
		price: 750,
		foodType: "spicy",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/901/1767d538164bf58f15c00d37e7197901.jpg",
	},
];

const breads = [
	{
		name: "Tandoori Roti",
		description: null,
		category: "Breads",
		price: 120,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/a62/b1e746cea233a01a56368bf963bcba62.jpg",
	},
	{
		name: "Butter Naan",
		description: null,
		category: "Breads",
		price: 100,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/437/37521ee5db5bbb5f3398870cd36f0437.jpg",
	},
	{
		name: "Cheese Kulcha",
		description: null,
		category: "Breads",
		price: 180,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/1f6/0caeff7f0fd2f11b07156776398b81f6.jpg",
	},
	{
		name: "Tandoori Roti",
		description: null,
		category: "Breads",
		price: 100,
		foodType: null,
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/897/5438b36bd0eb9498dd095bb628ae9897.jpg",
	},
];

const beverages = [
	{
		name: "Chocolate Milkshake",
		description: null,
		category: "Beverages",
		price: 450,
		foodType: "sweet",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/cf1/e7ef9c4788459485c1e2fe5ac3398cf1.jpg",
	},
	{
		name: "Rooh Afza",
		description: null,
		category: "Beverages",
		price: 400,
		foodType: "sweet",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/841/d8339ee1bb8ff6957fc53fd9b00e9841.jpg",
	},
	{
		name: "Sweet Lassi",
		description: null,
		category: "Beverages",
		price: 250,
		foodType: "sweet",
		veg: "veg",
		image: "https://b.zmtcdn.com/data/dish_photos/0d3/4a4eec00227db36ad4bc380ec97dd0d3.jpg",
	},
];

const desserts = [
	{
		name: "Falooda",
		description: null,
		category: "Desserts",
		price: 450,
		foodType: "sweet",
		veg: "veg",
		image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNagtidO6K8puIclUH4pDKKQmnLMTu1uQOgeV-gOGyfilMahQ&s",
	},
	{
		name: "Strawberry Ice Cream",
		description: null,
		category: "Desserts",
		price: 350,
		foodType: "sweet",
		veg: "veg",
		image: "https://images.media-allrecipes.com/userphotos/838110.jpg",
	},
	{
		name: "Chocolate Brownie",
		description: null,
		category: "Desserts",
		price: 500,
		foodType: "sweet",
		veg: "veg",
		image: "https://irepo.primecp.com/2015/04/218935/Death-By-Chocolate_MASTER_ID-977271.jpg?v=977271",
	},
];

let menus = [...mainCourse, ...rice, ...eggDishes, ...friedRice, ...empireBox, ...breads, ...beverages, ...desserts] as TMenu[];

menus = menus.map((menu, index) => {
	menu._id = new mongoose.Types.ObjectId(`${REF_EMPIRE}${TYPE_MENU}${ID_SUFFIX}${index.toString().padStart(6, "0")}`);
	menu.restaurantID = "empire";
	if (!menu?.taxPercent) menu.taxPercent = 15;
	if (!menu?.hidden) menu.hidden = false;
	return menu;
});

export { menus };
