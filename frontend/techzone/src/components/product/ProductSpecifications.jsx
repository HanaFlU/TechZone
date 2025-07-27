import React from 'react';

const ProductSpecifications = ({ specs, title = "Thông số kỹ thuật" }) => {
  // Debug logging
  console.log('ProductSpecifications received specs:', specs);
  
  // Handle different specs formats
  const formatSpecs = (specs) => {
    if (!specs) {
      console.log('No specs provided');
      return [];
    }
    
    // If specs is already an array of objects with label/value
    if (Array.isArray(specs)) {
      console.log('Specs is array format:', specs);
      // Handle both formats: {label, value} and {key, label, value}
      return specs.map(spec => ({
        label: spec.label || spec.key || 'Unknown',
        value: spec.value || ''
      }));
    }
    
    // If specs is an object with key-value pairs
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      console.log('Specs is object format:', specs);
      return Object.entries(specs).map(([key, value]) => ({
        label: key,
        value: value
      }));
    }
    
    console.log('Unknown specs format:', specs);
    return [];
  };

           const formattedSpecs = formatSpecs(specs);
         console.log('Formatted specs:', formattedSpecs);
       
         // Check if all specs have empty values
         const hasValidSpecs = formattedSpecs && formattedSpecs.length > 0 && 
           formattedSpecs.some(spec => spec.value && spec.value.trim() !== "");
       
         if (!formattedSpecs || formattedSpecs.length === 0 || !hasValidSpecs) {
           console.log('No valid specs to display');
           return (
             <div className="bg-white rounded-lg p-6 border border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                            <div className="text-sm text-gray-500 italic">
               Sản phẩm này đang cập nhật thông số kỹ thuật
             </div>
             </div>
           );
         }

           return (
           <div className="bg-white rounded-lg p-6 border border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
             <div className="space-y-3">
               {formattedSpecs
                 .filter(spec => spec.value && spec.value.trim() !== "")
                 .map((spec, index) => (
                   <div 
                     key={index} 
                     className="flex border-b border-gray-100 pb-2 last:border-b-0"
                   >
                     <span className="w-1/3 text-sm font-medium text-gray-700">
                       {spec.label}
                     </span>
                     <span className="w-2/3 text-sm text-gray-600">
                       {spec.value}
                     </span>
                   </div>
                 ))}
             </div>
           </div>
         );
};

export default ProductSpecifications; 