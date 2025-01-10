'use client';
import { useEffect, useState } from 'react';
import { useUpdateMutation } from '../query';
import { ToastContainer } from 'react-toastify';
import {
	GoogleMap,
	Marker,
	LoadScript,
	Autocomplete,
} from '@react-google-maps/api';
import withAuth from '../withAuth';

function Settings() {
	const [userId, setUserId] = useState();
	const [generalSettings, setGeneralSettings] = useState({
		name: '',
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
	});
	const [billingAddress, setBillingAddress] = useState('');
	const [deliveryOption, setDeliveryOption] = useState({
		flateRate: 0,
		byWeight: 0,
		byDistance: 0,
	});
	const [selectedDeliveryOption, setSelectedDeliveryOption] =
		useState('');
	const [coordinates, setCoordinates] = useState({
		lat: 43.65107,
		lng: -79.347015,
	});
	const [autocomplete, setAutocomplete] = useState(null);
	const [address, setAddress] = useState('');

	useEffect(() => {
		const user = JSON.parse(
			localStorage.getItem('meatmeuserSupplier')
		);
		if (user) {
			setUserId(user);
			setGeneralSettings({
				name: user.name || '',
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || '',
				phone: user.phone || '',
			});
			setBillingAddress(user.billingAddress || '');
			setDeliveryOption({
				flateRate: user.deliveryOption.flateRate || 0,
				byWeight: user.deliveryOption.byWeight || 0,
				byDistance: user.deliveryOption.byDistance || 0,
			});
			setSelectedDeliveryOption(user.selectedDeliveryOption);
			setAddress(user.address);
		}
	}, []);

	const handleGeneralSettingsChange = (e) => {
		const { name, value } = e.target;
		setGeneralSettings((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handlePricingChange = (e) => {
		const { name, value } = e.target;
		setDeliveryOption((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleDeliveryOptionChange = (e) => {
		setSelectedDeliveryOption(e.target.value);
	};

	const updateMutation = useUpdateMutation();

	const handleSubmit = (e) => {
		e.preventDefault();
		const url = `supplier`;
		const queryKey = 'admin';
		updateMutation.mutate({
			data: {
				...generalSettings,
				id: userId?._id,
				address,
				billingAddress,
				deliveryOption,
				selectedDeliveryOption,
			},
			url,
			queryKey,
		});
	};

	const handleAddressChange = async (address) => {
		try {
			const response = await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
					address
				)}&key=AIzaSyBFZW8emYS3DQLTWsd0IIFw6TM87CKD4pA`
			);
			const data = await response.json();
			if (data.results && data.results[0]) {
				const location = data.results[0].geometry.location;
				setCoordinates({ lat: location.lat, lng: location.lng });
			}
		} catch (error) {
			console.error('Error fetching geocode:', error);
		}
	};

	const onLoad = (autocompleteInstance) => {
		setAutocomplete(autocompleteInstance);
	};

	const onPlaceChanged = () => {
		if (autocomplete !== null) {
			const place = autocomplete.getPlace();
			const location = place.geometry?.location;
			const formattedAddress = place.formatted_address;

			if (location) {
				setCoordinates({
					lat: location.lat(),
					lng: location.lng(),
				});
			}

			if (formattedAddress) {
				setAddress(formattedAddress);
			}
		} else {
			console.log('Autocomplete is not loaded yet!');
		}
	};

	return (
		<>
			<div className='container mx-auto px-4 mt-12'>
				<ToastContainer />
				{/* General Settings */}
				<div className='bg-white p-4 rounded-lg shadow text-black'>
					<div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
						<div className='flex flex-col'>
							<label
								htmlFor='name'
								className='text-black mb-3 font-normal'
							>
								Company Name
							</label>
							<input
								type='text'
								id='name'
								name='name'
								value={generalSettings.name}
								onChange={handleGeneralSettingsChange}
								className='w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
								style={{ outlineWidth: '1px' }}
							/>
						</div>

						<div className='flex flex-col'>
							<label
								htmlFor='firstName'
								className='text-black mb-3 font-normal'
							>
								First Name
							</label>
							<input
								type='text'
								id='firstName'
								name='firstName'
								value={generalSettings.firstName}
								onChange={handleGeneralSettingsChange}
								className='w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
								style={{ outlineWidth: '1px' }}
							/>
						</div>

						<div className='flex flex-col'>
							<label
								htmlFor='lastName'
								className='text-black mb-3 font-normal'
							>
								Last Name
							</label>
							<input
								type='text'
								id='lastName'
								name='lastName'
								value={generalSettings.lastName}
								onChange={handleGeneralSettingsChange}
								className='w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
								style={{ outlineWidth: '1px' }}
							/>
						</div>

						<div className='flex flex-col'>
							<label
								htmlFor='email'
								className='text-black mb-3 font-normal'
							>
								Email
							</label>
							<input
								type='email'
								id='email'
								name='email'
								value={generalSettings.email}
								onChange={handleGeneralSettingsChange}
								className='w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
								style={{ outlineWidth: '1px' }}
							/>
						</div>

						<div className='flex flex-col'>
							<label
								htmlFor='phone'
								className='text-black mb-3 font-normal'
							>
								Phone Number
							</label>
							<input
								type='text'
								id='phone'
								name='phone'
								value={generalSettings.phone}
								onChange={handleGeneralSettingsChange}
								className='w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
								style={{ outlineWidth: '1px' }}
							/>
						</div>

						<div className='flex flex-col mt-4'>
							<label
								htmlFor='billingAddress'
								className='text-black mb-3 font-normal'
							>
								Billing Address
							</label>
							<input
								type='text'
								id='billingAddress'
								name='billingAddress'
								value={billingAddress}
								onChange={(e) => setBillingAddress(e.target.value)}
								className='w-full p-2 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
								style={{ outlineWidth: '1px' }}
							/>
						</div>
					</div>

					<div className='mt-6'>
						<LoadScript
							googleMapsApiKey='AIzaSyBFZW8emYS3DQLTWsd0IIFw6TM87CKD4pA'
							libraries={['places']}
						>
							<Autocomplete
								className='mt-4'
								onLoad={onLoad}
								onPlaceChanged={onPlaceChanged}
							>
								<div className='mb-6'>
									<label
										htmlFor='address'
										className='text-black mb-3 font-normal'
									>
										Address
									</label>
									<input
										name='address'
										className='w-full p-2 mt-3 rounded bg-gray-100 py-3 focus:outline-none focus:outline-[#5a46cf]'
										type='text'
										placeholder='Enter your shipping address'
										value={address}
										onChange={(e) => {
											setAddress(e.target.value);
											handleAddressChange(e.target.value);
										}}
										style={{ outlineWidth: '1px' }}
									/>
								</div>
							</Autocomplete>

							<GoogleMap
								center={coordinates}
								zoom={15}
								mapContainerStyle={{ width: '100%', height: '300px' }}
							>
								<Marker position={coordinates} />
							</GoogleMap>
						</LoadScript>
					</div>

					{/* New section for options */}
					<div className='flex flex-col mt-6'>
						<h2 className='text-lg font-semibold text-black mb-4'>
							Options
						</h2>

						<div className='flex items-center mb-4'>
							<input
								type='radio'
								id='flatRate'
								name='deliveryOption'
								value='flateRate'
								checked={selectedDeliveryOption === 'flateRate'}
								onChange={handleDeliveryOptionChange}
								className='mr-6'
							/>
							<label
								htmlFor='flatRate'
								className='text-black font-normal w-1/4'
							>
								Flat Rate
							</label>
							<div className='flex items-center ml-4 w-1/2'>
								<span className='mr-2'>$</span>
								<input
									type='number'
									value={deliveryOption?.flateRate}
									className='w-full p-2 rounded bg-gray-100 focus:outline-none focus:outline-[#5a46cf]'
									placeholder='Enter amount'
									name='flateRate'
									onChange={handlePricingChange}
								/>
							</div>
						</div>

						<div className='flex items-center mb-4'>
							<input
								type='radio'
								id='byWeight'
								name='deliveryOption'
								value='byWeight'
								checked={selectedDeliveryOption === 'byWeight'}
								onChange={handleDeliveryOptionChange}
								className='mr-6'
							/>
							<label
								htmlFor='byWeight'
								className='text-black font-normal w-1/4'
							>
								By Weight
							</label>
							<div className='flex items-center ml-4 w-1/2'>
								<span className='mr-2'>$</span>
								<input
									type='number'
									value={deliveryOption?.byWeight}
									className='w-full p-2 rounded bg-gray-100 focus:outline-none focus:outline-[#5a46cf]'
									placeholder='Enter weight'
									name='byWeight'
									onChange={handlePricingChange}
								/>
							</div>
						</div>

						<div className='flex items-center mb-4'>
							<input
								type='radio'
								id='byDistance'
								name='deliveryOption'
								value='byDistance'
								checked={selectedDeliveryOption === 'byDistance'}
								onChange={handleDeliveryOptionChange}
								className='mr-6'
							/>
							<label
								htmlFor='byDistance'
								className='text-black font-normal w-1/4'
							>
								By Distance
							</label>
							<div className='flex items-center ml-4 w-1/2'>
								<span className='mr-2'>$</span>
								<input
									type='number'
									value={deliveryOption?.byDistance}
									className='w-full p-2 rounded bg-gray-100 focus:outline-none focus:outline-[#5a46cf]'
									placeholder='Enter distance'
									name='byDistance'
									onChange={handlePricingChange}
								/>
							</div>
						</div>
					</div>

					<button
						className='bg-[#5a46cf] text-white font-bold py-2 px-4 rounded-md mt-4 w-[190px]'
						onClick={handleSubmit}
					>
						Save
					</button>
				</div>
			</div>
		</>
	);
}

export default withAuth(Settings);
