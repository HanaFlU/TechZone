import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { TreeItem, SimpleTreeView } from '@mui/x-tree-view';
import { IoChevronDownOutline, IoChevronForward } from 'react-icons/io5';

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

  const selectedCategory = categories.find(cat => cat._id === selectedId);
  const topLevelCategories = categories.filter(cat => !cat.parent);

  const handleNodeSelect = (event, nodeId) => {
    onSelect(nodeId);
    setShowTree(false); // ẩn sau khi chọn
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {selectedCategory ? `Đã chọn: ${selectedCategory.name}` : 'Chưa chọn danh mục'}
      </Typography>
      <Button variant="outlined" onClick={() => setShowTree(prev => !prev)}>
        {showTree ? 'Ẩn danh mục' : 'Chọn danh mục'}
      </Button>

      {showTree && (
        <Box sx={{ mt: 2, border: '1px solid #ccc', borderRadius: 1, p: 1 }}>
          <SimpleTreeView
            selectedItem={selectedId}
            onNodeSelect={handleNodeSelect}
            defaultCollapseIcon={<IoChevronDownOutline />}
            defaultExpandIcon={<IoChevronForward />}
          >
            {renderTree(topLevelCategories, categories)}
          </SimpleTreeView>
        </Box>
      )}
    </Box>
  );
}
