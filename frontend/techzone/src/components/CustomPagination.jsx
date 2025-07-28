import React, { useState, useEffect } from 'react';
import {
    TablePagination,
    Typography,
    Box,
    Input,
    IconButton,
} from '@mui/material';
import { TbPlayerTrackNextFilled } from 'react-icons/tb';
import { TbPlayerTrackPrevFilled } from "react-icons/tb";

const CustomTablePagination = ({
    count,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions,
    ...rest
}) => {
    const [pageInput, setPageInput] = useState(page + 1);

    const totalPages = Math.ceil(count / rowsPerPage);

    useEffect(() => {
        setPageInput(page + 1);
    }, [page]);

    const handlePageInputChange = (event) => {
        setPageInput(event.target.value);
    };

    const handleGoToPage = (event) => {
        if (event.key === 'Enter') {
        let newPage = parseInt(pageInput, 10) - 1; 

        if (isNaN(newPage) || newPage < 0) {
            newPage = 0; 
        } else if (newPage >= totalPages && totalPages > 0) {
            newPage = totalPages - 1;
        } else if (totalPages === 0) { 
            newPage = 0;
        }

        onPageChange(event, newPage);
        setPageInput(newPage + 1); 
        }
    };

    const handleGoToFirstPage = (event) => {
        onPageChange(event, 0);
    };

  const handleGoToLastPage = (event) => {
    const lastPage = totalPages > 0 ? totalPages - 1 : 0;
    onPageChange(event, lastPage);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <IconButton
            size="small"
            onClick={handleGoToFirstPage}
            disabled={page === 0 || totalPages === 0}      
        >
            <TbPlayerTrackPrevFilled size={20} /> 
        </IconButton>
        <Input
            type="number"
            size="small"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handleGoToPage}
            inputProps={{ min: 1, max: totalPages > 0 ? totalPages : 1 }}
            sx={{ width: '50px', textAlign: 'center', border: '1px solid #ccc', p:0 }}
        />
        <Typography variant="body2">
            / {totalPages}
        </Typography>
        <IconButton
            size="small"
            onClick={handleGoToLastPage}
            disabled={page === totalPages - 1 || totalPages === 0}
        >
            <TbPlayerTrackNextFilled size={20} />
        </IconButton>

        <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
            {...rest}
        />
    </Box>
  );
};

export default CustomTablePagination;