import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { TreeItem, SimpleTreeView } from '@mui/x-tree-view';
import { IoChevronDownOutline, IoChevronForward } from 'react-icons/io5';
import { FaCheckCircle, FaChevronDown, FaChevronUp, FaExclamationCircle } from 'react-icons/fa';

const renderTree = (nodes, allCategories) => {
  return nodes.map((node) => {
    const children = allCategories.filter(cat => cat.parent === node._id);
    return (
      <TreeItem
        key={node._id}
        itemId={node._id} // dùng itemId thay vì nodeId
        label={node.name}
      >
        {children.length > 0 && renderTree(children, allCategories)}
      </TreeItem>
    );
  });
};
export default function CategoryTreeSelector({ categories, selectedId, onSelect }) {
  const [showTree, setShowTree] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = React.useState(null);

  const selectedCategory = categories.find(cat => cat._id === selectedId);
  const topLevelCategories = categories.filter(cat => !cat.parent);


  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    if (isSelected) {
      setLastSelectedItem(itemId);
      onSelect(itemId);
    }
  };

  return (
    <Box>
      <Typography variant="body1" display="flex" alignItems="center" sx={{ mb: 1, gap: 1 }}>
        {selectedCategory ? (
          <>
            <Typography variant="body1" display="flex" alignItems="center" sx={{ mb: 1, gap: 1 }}>
              <FaCheckCircle color="green" />
              <Typography variant="body1" component="span" color="green">
                Đã chọn: {selectedCategory.name}
              </Typography>
            </Typography>

          </>
        ) : (
          <>
            <Typography variant="body1" display="flex" alignItems="center" sx={{ mb: 1, gap: 1 }}>
              <FaExclamationCircle color="orange" />
              <Typography variant="body1" component="span" color="orange">
                Chưa chọn danh mục
              </Typography>
            </Typography>

          </>
        )}
      </Typography>

      <Button
        variant="text"
        color="inherit"
        onClick={() => setShowTree(prev => !prev)}
        startIcon={showTree ? <FaChevronUp /> : <FaChevronDown />}
      >
        {showTree ? 'Ẩn danh mục' : 'Chọn danh mục'}
      </Button>

      {showTree && (
        <Box sx={{ mt: 2, border: '1px solid #ccc', borderRadius: 1, p: 1 }}>
          <SimpleTreeView
            selectedItems={[selectedId]}
            onItemSelectionToggle={handleItemSelectionToggle}
          >
            {renderTree(topLevelCategories, categories)}
          </SimpleTreeView>
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              setLastSelectedItem(null);
              onSelect(null);
            }}
          >
            Bỏ chọn danh mục
          </Button>

        </Box>
      )}
    </Box>
  );
}
