import React from 'react';
import { Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // componentDidCatch(error, errorInfo) {
  // }

  /* eslint-disable react/no-danger */
  render() {
    const { error, hasError } = this.state;
    if (hasError) {
      return (
        <Alert severity="error">
          <code
            dangerouslySetInnerHTML={{
              __html: error.stack.replaceAll('\n', '<br>').replaceAll(' ', '&nbsp;'),
            }}
          />
        </Alert>
      );
    }
    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;
