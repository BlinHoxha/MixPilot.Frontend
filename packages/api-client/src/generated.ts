export interface paths {
    "/api/v1/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Capabilities_Get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/collections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Collections_Search"];
        put?: never;
        post: operations["Collections_Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/collections/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Collections_Get"];
        put: operations["Collections_Update"];
        post?: never;
        delete: operations["Collections_Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/imports/csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Imports_Import"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Profile_Get"];
        put: operations["Profile_Save"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/{id}/explanation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["SetExplanations_Explain"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Sets_Search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Sets_Get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/{id}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Sets_Versions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/{id}/versions/{version}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Sets_Version"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Sets_Generate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/{id}/regenerate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["Sets_Regenerate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/sets/{id}/tracks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["Sets_Edit"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Tracks_Search"];
        put?: never;
        post: operations["Tracks_Create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tracks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["Tracks_Get"];
        put: operations["Tracks_Update"];
        post?: never;
        delete: operations["Tracks_Delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ApiProblemResponse: {
            type?: string;
            title?: string;
            /** Format: int32 */
            status?: number;
            detail?: string | null;
            instance?: string | null;
            code?: string;
            traceId?: string;
            errors?: {
                [key: string]: string[];
            } | null;
        };
        CapabilitiesResponse: {
            apiVersion?: string;
            enabledFeatures?: string[];
            plannedFeatures?: string[];
            /** Format: int32 */
            maximumPageSize?: number;
            /** Format: int32 */
            maximumCsvRows?: number;
            audioOperationsAvailable?: boolean;
            promptInterpretationAvailable?: boolean;
        };
        CapabilitiesResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["CapabilitiesResponse"];
            error?: string | null;
        };
        CitationResponse: {
            /** Format: uuid */
            documentId?: string;
            title?: string;
            excerpt?: string;
            sourceUri?: string | null;
            /** Format: int32 */
            chunkNumber?: number;
        };
        CollectionResponse: {
            /** Format: uuid */
            id?: string;
            /** Format: int32 */
            revision?: number;
            name?: string;
            trackIds?: string[];
        };
        CollectionResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["CollectionResponse"];
            error?: string | null;
        };
        CollectionResponsePageResponse: {
            items?: components["schemas"]["CollectionResponse"][];
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            readonly totalPages?: number;
        };
        CollectionResponsePageResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["CollectionResponsePageResponse"];
            error?: string | null;
        };
        CreateTrackRequest: {
            artist: string;
            title: string;
            version?: string;
            /** Format: int32 */
            durationSeconds?: number;
            /** Format: double */
            bpm?: number | null;
            musicalKey?: string | null;
            /** Format: int32 */
            energy?: number | null;
            genre?: string;
            mood?: string;
            hasVocals?: boolean | null;
            authorizationConfirmed?: boolean;
            keepDuplicate?: boolean;
        };
        CsvImportRequest: {
            csv: string;
            authorizationConfirmed?: boolean;
        };
        EditSetRequest: {
            /** Format: int32 */
            expectedRevision?: number;
            orderedTrackIds: string[];
            lockedTrackIds: string[];
        };
        /** @enum {string} */
        EnergyCurveType: "gradualBuild" | "wave" | "peakAndCooldown" | "highEnergy" | "warmUp";
        ExplainSetRequest: {
            question: string;
        };
        GenerateSetRequest: {
            name: string;
            requirements: components["schemas"]["SetRequirementsRequest"];
        };
        GroundedAnswerResponse: {
            answer?: string;
            grounded?: boolean;
            provider?: string;
            citations?: components["schemas"]["CitationResponse"][];
        };
        ImportResponse: {
            /** Format: int32 */
            createdCount?: number;
            /** Format: int32 */
            skippedDuplicateCount?: number;
            createdTrackIds?: string[];
        };
        ImportResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["ImportResponse"];
            error?: string | null;
        };
        /** @enum {string} */
        OrderDirection: "asc" | "desc";
        /** @enum {string} */
        PlanningMode: "planning" | "mixable";
        ProblemDetails: {
            type?: string | null;
            title?: string | null;
            /** Format: int32 */
            status?: number | null;
            detail?: string | null;
            instance?: string | null;
        } & {
            [key: string]: unknown;
        };
        ProfileResponse: {
            /** Format: int32 */
            revision?: number;
            displayName?: string;
            preferredGenre?: string;
            /** Format: double */
            minBpm?: number;
            /** Format: double */
            maxBpm?: number;
            preferVocals?: boolean | null;
        };
        ProfileResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["ProfileResponse"];
            error?: string | null;
        };
        RegenerateSetRequest: {
            /** Format: int32 */
            expectedRevision?: number;
            requirements: components["schemas"]["SetRequirementsRequest"];
        };
        RightsResponse: {
            canReference?: boolean;
            canAnalyze?: boolean;
            canStream?: boolean;
            canDownload?: boolean;
            canTempoShift?: boolean;
            canKeyShift?: boolean;
            canMix?: boolean;
            canExportAudio?: boolean;
            canPublish?: boolean;
            territories?: string[];
            /** Format: date-time */
            licenseStart?: string | null;
            /** Format: date-time */
            licenseEnd?: string | null;
        };
        SaveCollectionRequest: {
            name: string;
            trackIds: string[];
            /** Format: int32 */
            expectedRevision?: number;
        };
        SaveProfileRequest: {
            displayName: string;
            preferredGenre?: string;
            /** Format: double */
            minBpm?: number;
            /** Format: double */
            maxBpm?: number;
            preferVocals?: boolean | null;
            /** Format: int32 */
            expectedRevision?: number;
        };
        SetExplanationResponse: {
            /** Format: uuid */
            setId?: string;
            /** Format: int32 */
            version?: number;
            explanation?: components["schemas"]["GroundedAnswerResponse"];
        };
        SetExplanationResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["SetExplanationResponse"];
            error?: string | null;
        };
        SetRequirementsRequest: {
            /** Format: int32 */
            durationSeconds?: number;
            /** Format: double */
            minBpm?: number;
            /** Format: double */
            maxBpm?: number;
            genre?: string | null;
            mood?: string | null;
            hasVocals?: boolean | null;
            energyCurve?: components["schemas"]["EnergyCurveType"];
            mode?: components["schemas"]["PlanningMode"];
            territory: string;
            excludedTrackIds: string[];
        };
        SetResponse: {
            /** Format: uuid */
            id?: string;
            name?: string;
            /** Format: int32 */
            revision?: number;
            /** Format: int32 */
            version?: number;
            requirements?: components["schemas"]["SetRequirementsRequest"];
            /** Format: int32 */
            durationSeconds?: number;
            tracks?: components["schemas"]["SetTrackResponse"][];
            warnings?: string[];
            /** Format: date-time */
            updatedAt?: string;
        };
        SetResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["SetResponse"];
            error?: string | null;
        };
        SetSummaryResponse: {
            /** Format: uuid */
            id?: string;
            name?: string;
            /** Format: int32 */
            revision?: number;
            /** Format: date-time */
            updatedAt?: string;
        };
        SetSummaryResponsePageResponse: {
            items?: components["schemas"]["SetSummaryResponse"][];
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            readonly totalPages?: number;
        };
        SetSummaryResponsePageResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["SetSummaryResponsePageResponse"];
            error?: string | null;
        };
        SetTrackResponse: {
            /** Format: int32 */
            position?: number;
            /** Format: uuid */
            trackId?: string;
            artist?: string;
            title?: string;
            version?: string;
            /** Format: int32 */
            durationSeconds?: number;
            /** Format: double */
            bpm?: number | null;
            musicalKey?: string | null;
            /** Format: int32 */
            energy?: number | null;
            source?: components["schemas"]["SourceType"];
            availability?: string;
            isLocked?: boolean;
            /** Format: double */
            compatibility?: number;
            reasons?: string[];
            rights?: components["schemas"]["RightsResponse"];
        };
        SetVersionResponse: {
            /** Format: int32 */
            version?: number;
            /** Format: date-time */
            createdAt?: string;
        };
        SetVersionResponseIReadOnlyListCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["SetVersionResponse"][] | null;
            error?: string | null;
        };
        /** @enum {string} */
        SourceType: "myLibrary" | "externalReference" | "licensedCatalog" | "platformOriginal";
        TrackResponse: {
            /** Format: uuid */
            id?: string;
            /** Format: int32 */
            revision?: number;
            artist?: string;
            title?: string;
            version?: string;
            /** Format: int32 */
            durationSeconds?: number;
            /** Format: double */
            bpm?: number | null;
            musicalKey?: string | null;
            /** Format: int32 */
            energy?: number | null;
            genre?: string;
            mood?: string;
            hasVocals?: boolean | null;
            source?: components["schemas"]["SourceType"];
            availability?: string;
            sourceUrl?: string | null;
            rights?: components["schemas"]["RightsResponse"];
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
        TrackResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["TrackResponse"];
            error?: string | null;
        };
        TrackResponsePageResponse: {
            items?: components["schemas"]["TrackResponse"][];
            /** Format: int32 */
            pageNumber?: number;
            /** Format: int32 */
            pageSize?: number;
            /** Format: int32 */
            totalCount?: number;
            /** Format: int32 */
            readonly totalPages?: number;
        };
        TrackResponsePageResponseCommonResult: {
            succeeded?: boolean;
            data?: components["schemas"]["TrackResponsePageResponse"];
            error?: string | null;
        };
        /** @enum {string} */
        TrackSort: "title" | "artist" | "bpm" | "createdAt";
        UpdateTrackRequest: {
            artist: string;
            title: string;
            version?: string;
            /** Format: int32 */
            durationSeconds?: number;
            /** Format: double */
            bpm?: number | null;
            musicalKey?: string | null;
            /** Format: int32 */
            energy?: number | null;
            genre?: string;
            mood?: string;
            hasVocals?: boolean | null;
            /** Format: int32 */
            expectedRevision?: number;
            keepDuplicate?: boolean;
        };
        ValidationProblemDetails: {
            type?: string | null;
            title?: string | null;
            /** Format: int32 */
            status?: number | null;
            detail?: string | null;
            instance?: string | null;
            errors?: {
                [key: string]: string[];
            };
        } & {
            [key: string]: unknown;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    Capabilities_Get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["CapabilitiesResponseCommonResult"];
                    "application/json": components["schemas"]["CapabilitiesResponseCommonResult"];
                    "text/json": components["schemas"]["CapabilitiesResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Collections_Search: {
        parameters: {
            query?: {
                PageNumber?: number;
                PageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["CollectionResponsePageResponseCommonResult"];
                    "application/json": components["schemas"]["CollectionResponsePageResponseCommonResult"];
                    "text/json": components["schemas"]["CollectionResponsePageResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Collections_Create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SaveCollectionRequest"];
                "text/json": components["schemas"]["SaveCollectionRequest"];
                "application/*+json": components["schemas"]["SaveCollectionRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["CollectionResponseCommonResult"];
                    "application/json": components["schemas"]["CollectionResponseCommonResult"];
                    "text/json": components["schemas"]["CollectionResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Collections_Get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["CollectionResponseCommonResult"];
                    "application/json": components["schemas"]["CollectionResponseCommonResult"];
                    "text/json": components["schemas"]["CollectionResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Collections_Update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SaveCollectionRequest"];
                "text/json": components["schemas"]["SaveCollectionRequest"];
                "application/*+json": components["schemas"]["SaveCollectionRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["CollectionResponseCommonResult"];
                    "application/json": components["schemas"]["CollectionResponseCommonResult"];
                    "text/json": components["schemas"]["CollectionResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Collections_Delete: {
        parameters: {
            query?: {
                expectedRevision?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Imports_Import: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CsvImportRequest"];
                "text/json": components["schemas"]["CsvImportRequest"];
                "application/*+json": components["schemas"]["CsvImportRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["ImportResponseCommonResult"];
                    "application/json": components["schemas"]["ImportResponseCommonResult"];
                    "text/json": components["schemas"]["ImportResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Profile_Get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["ProfileResponseCommonResult"];
                    "application/json": components["schemas"]["ProfileResponseCommonResult"];
                    "text/json": components["schemas"]["ProfileResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Profile_Save: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SaveProfileRequest"];
                "text/json": components["schemas"]["SaveProfileRequest"];
                "application/*+json": components["schemas"]["SaveProfileRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["ProfileResponseCommonResult"];
                    "application/json": components["schemas"]["ProfileResponseCommonResult"];
                    "text/json": components["schemas"]["ProfileResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    SetExplanations_Explain: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ExplainSetRequest"];
                "text/json": components["schemas"]["ExplainSetRequest"];
                "application/*+json": components["schemas"]["ExplainSetRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetExplanationResponseCommonResult"];
                    "application/json": components["schemas"]["SetExplanationResponseCommonResult"];
                    "text/json": components["schemas"]["SetExplanationResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description AI is disabled or its provider is unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Search: {
        parameters: {
            query?: {
                PageNumber?: number;
                PageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetSummaryResponsePageResponseCommonResult"];
                    "application/json": components["schemas"]["SetSummaryResponsePageResponseCommonResult"];
                    "text/json": components["schemas"]["SetSummaryResponsePageResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetResponseCommonResult"];
                    "application/json": components["schemas"]["SetResponseCommonResult"];
                    "text/json": components["schemas"]["SetResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Versions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetVersionResponseIReadOnlyListCommonResult"];
                    "application/json": components["schemas"]["SetVersionResponseIReadOnlyListCommonResult"];
                    "text/json": components["schemas"]["SetVersionResponseIReadOnlyListCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Version: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                version: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetResponseCommonResult"];
                    "application/json": components["schemas"]["SetResponseCommonResult"];
                    "text/json": components["schemas"]["SetResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Generate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["GenerateSetRequest"];
                "text/json": components["schemas"]["GenerateSetRequest"];
                "application/*+json": components["schemas"]["GenerateSetRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetResponseCommonResult"];
                    "application/json": components["schemas"]["SetResponseCommonResult"];
                    "text/json": components["schemas"]["SetResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Regenerate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["RegenerateSetRequest"];
                "text/json": components["schemas"]["RegenerateSetRequest"];
                "application/*+json": components["schemas"]["RegenerateSetRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetResponseCommonResult"];
                    "application/json": components["schemas"]["SetResponseCommonResult"];
                    "text/json": components["schemas"]["SetResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Sets_Edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EditSetRequest"];
                "text/json": components["schemas"]["EditSetRequest"];
                "application/*+json": components["schemas"]["EditSetRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["SetResponseCommonResult"];
                    "application/json": components["schemas"]["SetResponseCommonResult"];
                    "text/json": components["schemas"]["SetResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Tracks_Search: {
        parameters: {
            query?: {
                Search?: string;
                Genre?: string;
                MinBpm?: number;
                MaxBpm?: number;
                SortBy?: components["schemas"]["TrackSort"];
                Direction?: components["schemas"]["OrderDirection"];
                PageNumber?: number;
                PageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["TrackResponsePageResponseCommonResult"];
                    "application/json": components["schemas"]["TrackResponsePageResponseCommonResult"];
                    "text/json": components["schemas"]["TrackResponsePageResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Tracks_Create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CreateTrackRequest"];
                "text/json": components["schemas"]["CreateTrackRequest"];
                "application/*+json": components["schemas"]["CreateTrackRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["TrackResponseCommonResult"];
                    "application/json": components["schemas"]["TrackResponseCommonResult"];
                    "text/json": components["schemas"]["TrackResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Tracks_Get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["TrackResponseCommonResult"];
                    "application/json": components["schemas"]["TrackResponseCommonResult"];
                    "text/json": components["schemas"]["TrackResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Tracks_Update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["UpdateTrackRequest"];
                "text/json": components["schemas"]["UpdateTrackRequest"];
                "application/*+json": components["schemas"]["UpdateTrackRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": components["schemas"]["TrackResponseCommonResult"];
                    "application/json": components["schemas"]["TrackResponseCommonResult"];
                    "text/json": components["schemas"]["TrackResponseCommonResult"];
                };
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
    Tracks_Delete: {
        parameters: {
            query?: {
                expectedRevision?: number;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Authentication required */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Permission denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Resource not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Revision or resource conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Domain constraints not satisfied */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ApiProblemResponse"];
                };
            };
        };
    };
}
