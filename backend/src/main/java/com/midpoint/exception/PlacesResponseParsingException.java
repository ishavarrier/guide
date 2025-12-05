package com.midpoint.exception;

/**
 * Exception thrown when there is an error parsing the response from the Google Places API
 */
public class PlacesResponseParsingException extends RuntimeException {
    
    public PlacesResponseParsingException(String message) {
        super(message);
    }
    
    public PlacesResponseParsingException(String message, Throwable cause) {
        super(message, cause);
    }
}

