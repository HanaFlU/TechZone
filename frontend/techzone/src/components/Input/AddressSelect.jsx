import React, { useState, useEffect } from 'react';
import Select from './Select';
import provincesData from '../../data/hanhchinhvn/tinh_tp.json';
import districtsData from '../../data/hanhchinhvn/quan_huyen.json';
import wardsData from '../../data/hanhchinhvn/xa_phuong.json';

const AddressSelect = ({
  selectedCity,
  selectedDistrict,
  selectedWard,
  onCityChange,
  onDistrictChange,
  onWardChange
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const formattedProvinces = Object.values(provincesData).map(p => ({
      value: p.name,
      label: p.name_with_type
    }));
    setProvinces(formattedProvinces);
  }, []);

  useEffect(() => {
    const cityCode = Object.values(provincesData).find(p => p.name === selectedCity)?.code;

    if (cityCode) {
      const filteredDistricts = Object.values(districtsData).filter(
        d => d.parent_code === cityCode
      ).map(d => ({
        value: d.name,
        label: d.name_with_type
      }));
      setDistricts(filteredDistricts);

      const currentDistrictIsValid = filteredDistricts.some(d => d.value === selectedDistrict);
      if (!currentDistrictIsValid && selectedDistrict !== '') {
        onDistrictChange('');
        onWardChange('');
      }
    } else {
      setDistricts([]);
      if (selectedDistrict !== '') {
        onDistrictChange('');
      }
      if (selectedWard !== '') {
        onWardChange('');
      }
    }
  }, [selectedCity, selectedDistrict, selectedWard, onDistrictChange, onWardChange]);

  useEffect(() => {
    const districtCode = Object.values(districtsData).find(d => d.name === selectedDistrict)?.code;

    if (districtCode) {
      const filteredWards = Object.values(wardsData).filter(
        w => w.parent_code === districtCode
      ).map(w => ({
        value: w.name,
        label: w.name_with_type
      }));
      setWards(filteredWards);

      const currentWardIsValid = filteredWards.some(w => w.value === selectedWard);
      if (!currentWardIsValid && selectedWard !== '') {
        onWardChange('');
      }
    } else {
      setWards([]);
      if (selectedWard !== '') {
        onWardChange('');
      }
    }
  }, [selectedDistrict, selectedWard, onWardChange]);

  return (
    <>
      <Select
        label="Tỉnh/Thành phố"
        id="city"
        name="city"
        value={selectedCity} 
        onChange={(e) => onCityChange(e.target.value)}
        options={[{ value: '', label: 'Chọn Tỉnh/Thành phố' }, ...provinces]}
        required
      />

      <Select
        label="Quận/Huyện"
        id="district"
        name="district"
        value={selectedDistrict}
        onChange={(e) => onDistrictChange(e.target.value)}
        options={[{ value: '', label: 'Chọn Quận/Huyện' }, ...districts]}
        disabled={!selectedCity || provinces.length === 0} 
        required
      />

      <Select
        label="Phường/Xã"
        id="ward"
        name="ward"
        value={selectedWard}
        onChange={(e) => onWardChange(e.target.value)}
        options={[{ value: '', label: 'Chọn Phường/Xã' }, ...wards]}
        disabled={!selectedDistrict || districts.length === 0} 
        required
      />
    </>
  );
};

export default AddressSelect;